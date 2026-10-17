// Binds the pure plan rollup (workflow/planRollup.ts) to real rows: fresh-read
// one plan's DIRECT membership, ask the pure layer for a proposal, and apply it
// through the one write door (Plan.transitionTo) — an out-of-date proposal the
// legality table refuses is dropped and logged, never applied. Plan
// consequences deliberately stay outside the work-item drain; the chain is
// walked inline, one parent_plan hop at a time.
import { gs } from '@servicenow/glide';
import * as records from '../glide/records.ts';
import { Plan } from '../domain/plan.ts';
import { proposePlanState } from '../workflow/planRollup.ts';
import { InvalidStateError } from '../shared/errors.ts';
import { planStateOf, stateName } from '../shared/states.ts';
const WI_TABLE = 'sn_build_agent_work_item';
const PLAN_TABLE = 'sn_build_agent_plan';
/**
 * Recompute `planId`'s state from its direct members, then its parent's — a
 * sub-plan settling can be exactly what settles the root. Returns the plan
 * transitions it APPLIED, in chain order, so the caller can follow a terminal
 * landing with its boundary release — deliberately not done here, because
 * importing the release machinery would close a module cycle with effects.ts.
 */
export function recomputePlanChain(planId) {
    const applied = [];
    let currentId = planId;
    while (currentId) {
        const plan = Plan.tryLoad(currentId);
        if (plan === null)
            return applied;
        applied.push(...recomputeOne(plan));
        currentId = plan.parent_plan_sys_id;
    }
    return applied;
}
// One plan's recompute, applied to a bounded FIXPOINT: one member change can
// legitimately move a plan TWO steps (standby → in_review → completed — the
// legality table deliberately has no shortcut edge), so apply and re-read until
// no proposal remains.
function recomputeOne(plan) {
    const applied = [];
    for (let hop = 0; hop < 3; hop++) {
        const proposal = proposePlanState({
            current: plan.state,
            memberItemStates: directItemStates(plan.sys_id),
            childPlanStates: directChildPlanStates(plan.sys_id),
            // Only a SUB-plan may be proposed completed; a root's completion is
            // always the human ceremony.
            isSubPlan: plan.parent_plan_sys_id !== ''
        });
        if (proposal === null)
            return applied;
        try {
            applied.push(plan.transitionTo(proposal.to, { standbyReason: proposal.standbyReason }));
        }
        catch (e) {
            // The door is the legality authority: an InvalidStateError means a stale
            // proposal (the facts moved under this recalculation) — dropped and logged;
            // the next trigger recomputes from fresh facts. Anything else rethrows.
            if (!(e instanceof InvalidStateError))
                throw e;
            gs.warn(`[build-agent] plan rollup dropped an illegal proposal ${plan.state} -> ${proposal.to} for plan ${plan.sys_id}`);
            return applied;
        }
    }
    return applied;
}
// The plan's OWN items' states — direct scope only, NOT the subtree rollup
// Plan.itemCounts uses: each level answers for its own members, and child plans
// enter as plans, not as their items.
function directItemStates(planId) {
    const out = [];
    const gr = records.newRecord(WI_TABLE);
    gr.addQuery('plan', planId);
    gr.query();
    while (gr.next())
        out.push(stateName(Number(gr.getValue('state'))));
    return out;
}
function directChildPlanStates(planId) {
    const out = [];
    const gr = records.newRecord(PLAN_TABLE);
    gr.addQuery('parent_plan', planId);
    gr.query();
    while (gr.next())
        out.push(planStateOf(gr.getValue('state'), `plan ${gr.getUniqueValue()}`));
    return out;
}
