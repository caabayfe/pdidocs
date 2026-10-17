// src/server/engine/plans.ts
// Thin wrappers over the Plan entity; plan logic lives on domain/plan.ts.
import { Plan } from '../domain/plan.ts';
import { WorkItem } from '../domain/workItem.ts';
import { recomputePlanChainAndRelease, sweepReadyItems } from './effects.ts';
import * as verbs from './verbs.ts';
import { label } from '../shared/label.ts';
import { dependentIdsOf, graphFor } from '../domain/dependencies.ts';
import { unmetPrerequisitePlans } from '../workflow/boundaries.ts';
import { acceptanceOrder } from '../workflow/foundation.ts';
import { markPlanUpdateSetComplete, resolvePlanUpdateSet } from '../glide/updateSets.ts';
import * as activity from '../glide/activity.ts';
import { conversationExists } from '../glide/conversationRecord.ts';
import { InvalidStateError, ValidationError } from '../shared/errors.ts';
export function createPlan(input) {
    if (input.parent_plan && input.conversation_id) {
        throw new ValidationError('parent_plan and conversation_id are mutually exclusive');
    }
    if (input.conversation_id && !conversationExists(input.conversation_id)) {
        throw new ValidationError(`conversation ${input.conversation_id} does not exist`);
    }
    if (input.conversation_id && activity.getActivityByConversation(input.conversation_id)) {
        throw new ValidationError(`conversation ${input.conversation_id} already has an activity`);
    }
    const plan = Plan.create({
        short_description: input.short_description,
        description: input.description,
        parent_plan: input.parent_plan
    });
    if (plan.parent_plan_sys_id)
        recomputePlanChainAndRelease(plan.parent_plan_sys_id);
    if (!input.conversation_id)
        return plan.toDto();
    const anchor = activity.insertActivity({
        conversation: input.conversation_id,
        kind: 'chat',
        plan: plan.sys_id
    });
    if (!anchor) {
        plan.delete();
        throw new Error('plan activity insert failed');
    }
    return plan.toDto();
}
// update_set is a write-time-only read of batch_update_set; null when unresolved.
export function getPlan(id) {
    const p = Plan.tryLoad(id);
    if (!p)
        return null;
    const { activated_on, completed_on } = activity.getPlanActivityBounds(id);
    return { ...p.toDto(), activated_on, completed_on };
}
export function getPlanByNumber(number) {
    const p = Plan.resolve({ number });
    const { activated_on, completed_on } = activity.getPlanActivityBounds(p.sys_id);
    return { ...p.toDto(), activated_on, completed_on };
}
export function listPlans(options) {
    return Plan.all(options);
}
export function listPlanChildren(id) {
    return Plan.load(id).children();
}
export function updatePlan(id, fields) {
    return Plan.load(id).updateContent(fields).toDto();
}
// This plan's own file attachments, projected as artifacts.
export function listPlanArtifacts(id) {
    return Plan.load(id).artifacts();
}
// Execute/Resume — the ONE writer of a root plan's standby → in_progress edge;
// the engine never promotes a plan to in_progress on its own. Already
// in_progress → no state write; the re-drive exists for the sweep. started_by
// doubles as the "ever activated" bit: a regressed child (started_by stamped)
// is skipped — only the user's sub-plan Resume reactivates it. An item that
// reached `ready` while the plan was held has already spent its dispatch
// trigger, hence sweepReadyItems. ATF flags apply only to this immediate sweep.
export function executePlan(id, principal, options) {
    const plan = Plan.load(id);
    plan.assertRootVerb();
    if (plan.state === 'standby')
        plan.transitionTo('in_progress', { principal });
    else if (plan.state !== 'in_progress')
        throw new InvalidStateError('execute is legal only from standby or in_progress', plan.state);
    const graph = graphFor(id);
    for (const child of plan.children()) {
        if (child.state !== 'standby')
            continue;
        if (child.started_by)
            continue;
        if (unmetPrerequisitePlans(child.sys_id, graph).length > 0)
            continue;
        Plan.load(child.sys_id).transitionTo('in_progress', { principal });
    }
    sweepReadyItems(Plan.load(id).workItems(), undefined, options);
}
// Hold closes the dispatch gate; in-flight work finishes naturally into
// in_review. The gate requires BOTH switches on (workflow/dispatch.ts), so
// holding the root alone stops every dispatch and sub-plans keep their own state.
export function holdPlan(id) {
    const plan = Plan.load(id);
    plan.assertRootVerb();
    if (plan.state === 'standby')
        return;
    if (plan.state !== 'in_progress')
        throw new InvalidStateError('hold is legal only from in_progress', plan.state);
    plan.transitionTo('standby', { standbyReason: 'held' });
}
// Sub-plan Resume — the ONE verb that legitimately targets a sub-plan; the root
// must already be running. The 409 for a non-running root carries the ROOT's state.
export function resumeSubPlan(id, principal) {
    const plan = Plan.load(id);
    if (!plan.parent_plan)
        throw new InvalidStateError('resume targets a sub-plan; use execute on a root plan', plan.state);
    if (plan.state !== 'standby')
        throw new InvalidStateError('resume is legal only from standby', plan.state);
    const root = Plan.load(plan.parent_plan_sys_id);
    if (root.state !== 'in_progress')
        throw new InvalidStateError(`resume requires the root plan (${root.number}) to be running`, root.state);
    plan.transitionTo('in_progress', { principal });
    sweepReadyItems(Plan.load(id).workItems());
}
// Cascading cancel: every non-terminal item in the subtree, then the plan.
// verbs.cancel already halts waiting dependents and evicts pending checkpoints —
// neither is duplicated here; one item's failure never stops the rest. The
// plan's landing is deterministic (re-read after the cascade, since the pipeline
// moved the row); a COMPLETED plan stays completed — terminals are absorbing.
export function cancelPlan(id, principal) {
    const plan = Plan.load(id);
    plan.assertRootVerb();
    const cancelled = [];
    const failed = [];
    for (const dto of plan.workItems()) {
        if (dto.state === 'completed' || dto.state === 'cancelled')
            continue;
        const name = label(dto);
        try {
            verbs.cancel(dto.sys_id);
            cancelled.push({ workItemId: dto.sys_id, name });
        }
        catch (e) {
            failed.push({ workItemId: dto.sys_id, name, error: e instanceof Error ? e.message : String(e) });
        }
    }
    // An empty or never-started child has no member transition to cancel it via
    // rollup; close every remaining direct child through the door before the root.
    for (const child of Plan.load(id).children()) {
        if (child.state === 'completed' || child.state === 'cancelled')
            continue;
        Plan.load(child.sys_id).transitionTo('cancelled', { principal });
    }
    const fresh = Plan.load(id);
    if (fresh.state !== 'completed' && fresh.state !== 'cancelled')
        fresh.transitionTo('cancelled', { principal });
    return { cancelled, failed };
}
// Delete every item through the work-item delete path, then sub-plans and the
// plan. Releases stay deferred until the cascade completes or aborts so internal
// dependents cannot dispatch during row removal; deleting a root reads an empty
// graph and releases nothing.
export function deletePlan(id) {
    const plan = Plan.load(id);
    const itemIds = plan.workItemIds();
    const graphRoot = plan.parent_plan_sys_id || plan.sys_id;
    const dependents = new Set();
    const dependentsByItem = new Map();
    for (const itemId of itemIds) {
        const ids = dependentIdsOf(itemId);
        dependentsByItem.set(itemId, ids);
        for (const dependentId of ids)
            dependents.add(dependentId);
    }
    let failure;
    try {
        for (const itemId of itemIds)
            verbs.preflightItemDelete(itemId);
        for (const itemId of itemIds)
            verbs.removeItem(itemId, dependentsByItem.get(itemId), true);
        plan.delete();
    }
    catch (e) {
        failure = e;
    }
    try {
        verbs.releaseDependents(graphRoot, [...dependents]);
    }
    catch (e) {
        if (failure === undefined)
            failure = e;
    }
    if (failure !== undefined)
        throw failure;
}
/**
 * Milestone review: one submission over parked members through the same
 * per-item accept door. Accepts in topological order; an already-completed
 * member is an idempotent no-op; one refusal never aborts independent accepts;
 * a ROOT never completes here (acceptPlan is the ceremony).
 */
export function reviewMilestone(planId, decision, principal) {
    const plan = Plan.load(planId);
    if (plan.state !== 'in_review')
        throw new InvalidStateError('review is legal only from in_review', plan.state);
    const acceptIds = decision.accept ?? [];
    if (!Array.isArray(acceptIds))
        throw new ValidationError('accept must be an array');
    if (acceptIds.length === 0)
        throw new ValidationError('a review submission must accept at least one item');
    const members = new Map(WorkItem.forPlan(plan.sys_id).map(dto => [dto.sys_id, dto]));
    for (const id of acceptIds) {
        const dto = members.get(id);
        if (!dto)
            throw new ValidationError(`work item ${id} is not a member of plan ${plan.number}`);
        if (dto.state !== 'in_review' && dto.state !== 'completed')
            throw new ValidationError(`work item ${label(dto)} is ${dto.state}; only a parked (in_review) item can be accepted`);
    }
    const accepted = [];
    const failed = [];
    for (const id of acceptanceOrder(acceptIds, graphFor(planId))) {
        const name = label(members.get(id));
        if (members.get(id).state === 'completed') {
            accepted.push({ workItemId: id, name });
            continue;
        }
        try {
            verbs.accept(id, principal);
            accepted.push({ workItemId: id, name });
        }
        catch (e) {
            failed.push({ workItemId: id, name, error: e instanceof Error ? e.message : String(e) });
        }
    }
    return { plan_state: Plan.load(planId).state, accepted, failed };
}
/**
 * Accept plan — root-only, in_review only. Bulk-accepts remaining parked items
 * in dependency order; unlike the milestone verb, a refusal ABORTS (a plan must
 * never complete around a refused member). The rollup never proposes completed
 * for a ROOT — this write IS the ceremony. A release failure never reverses it.
 */
export function acceptPlan(planId, principal) {
    const plan = Plan.load(planId);
    plan.assertRootVerb();
    if (plan.state !== 'in_review')
        throw new InvalidStateError('accept is legal only from in_review', plan.state);
    const parkedIds = plan
        .workItems()
        .filter(dto => dto.state === 'in_review')
        .map(dto => dto.sys_id);
    for (const id of acceptanceOrder(parkedIds, graphFor(planId)))
        verbs.accept(id, principal);
    // Re-loaded: the accept drains wrote the plan row through other instances.
    // The terminal guard only covers a concurrent cancel landing mid-loop.
    const fresh = Plan.load(planId);
    if (fresh.state !== 'completed' && fresh.state !== 'cancelled')
        fresh.transitionTo('completed', { principal });
    const release = releasePlan(planId);
    return { ...getPlan(planId), ...release };
}
/**
 * The release step, idempotent and callable standalone as the retry. Idempotency
 * is STRUCTURAL — no stored release state; the fresh read of sys_update_set.state
 * converges every retry/crash case. On failure the plan stays completed and one
 * "release failed" row lands on the timeline.
 */
export function releasePlan(planId) {
    const plan = Plan.load(planId);
    plan.assertRootVerb();
    if (plan.state !== 'completed')
        throw new InvalidStateError('release is legal only for a completed plan', plan.state);
    const batch = plan.batch_update_set;
    const result = batch ? markPlanUpdateSetComplete(batch) : { success: false, error: 'plan has no batch update set' };
    if (result.success || (batch && resolvePlanUpdateSet(batch)?.state === 'complete')) {
        return { release_state: 'complete', release_error: '' };
    }
    const error = result.error ?? 'release failed';
    activity.insertActivity({ kind: 'system', plan: planId, summary: `release failed: ${error}` });
    return { release_state: 'failed', release_error: error };
}
