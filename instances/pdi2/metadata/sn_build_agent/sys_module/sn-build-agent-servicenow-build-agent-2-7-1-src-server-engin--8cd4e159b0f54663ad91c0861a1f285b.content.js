// Binds the workflow's pure effect names to domain and platform operations.
// Workflow decides what follows a transition; this engine collaborator performs
// it and feeds any resulting transition back into the pure drain.
import { WorkItem } from '../domain/workItem.ts';
import { Plan } from '../domain/plan.ts';
import { evaluate } from '../workflow/readiness.ts';
import { shouldDispatch } from '../workflow/dispatch.ts';
import { unmetPrerequisitePlans } from '../workflow/boundaries.ts';
import { graphFor } from '../domain/dependencies.ts';
import { enqueueRun, prepareRun } from '../domain/dispatcher.ts';
import { retryMarkerForCount } from '../domain/automaticRetry.ts';
import { drain } from '../workflow/drain.ts';
import { settleNewestRunOrRecordSystem } from './activityOutcomes.ts';
import { chargeAssist, AE_WORK_ITEM_EXECUTION_CAPABILITY } from '../glide/assistBilling.ts';
import { recomputePlanChain } from './planRollup.ts';
const DISPATCH_FAILURE_SUMMARY = 'Run dispatch failed.';
export const effects = {
    loadWorkItem: id => WorkItem.tryLoad(id),
    applyWorkItem(effect, item, enqueue, transition) {
        if (effect === 'evaluateReadiness')
            return evaluateReadiness(item, enqueue, transition);
        if (effect === 'dispatch')
            return dispatch(item, enqueue, transition);
        // evaluatePlan: plan consequences are walked inline by recomputePlanChain,
        // deliberately outside the work-item drain; a terminal plan landing is a
        // boundary event whose release may enqueue work-item transitions here.
        if (effect === 'evaluatePlan')
            return recomputePlanChainAndRelease(item.plan_sys_id, enqueue);
        return evaluateDependents(item, enqueue);
    }
};
/**
 * THE one entry into the pipeline for a persisted transition. At top level (no
 * `enqueue`) it starts the drain; inside the pipeline it joins the drain already
 * running — an effect must never start a second, nested drain.
 */
export function transitionAndDrain(write, enqueue) {
    const t = write();
    if (t === null)
        return;
    if (enqueue)
        enqueue(t);
    else
        drain([t], effects);
}
function withRetryContext(t, source) {
    return source.automaticRetry ? { ...t, automaticRetry: source.automaticRetry } : t;
}
// draft -> waiting: can this item run yet, and if it never can, say why.
function evaluateReadiness(item, enqueue, transition) {
    const answer = evaluate(item.sys_id, graphFor(item.plan_sys_id));
    if (answer.answer === 'pending')
        return;
    if (answer.answer === 'met') {
        enqueue(withRetryContext(item.transitionTo('ready'), transition));
        return;
    }
    // impossible — surface it instead of resting in `waiting` forever. Runs INSIDE
    // the drain, so the halt is enqueued, never drained recursively.
    settleNewestRunOrRecordSystem(item, 'interrupted', answer.summary);
    transitionAndDrain(() => item.halt(), enqueue);
}
// waiting -> ready: claim the state FIRST so a second drain cannot dispatch the
// same item, then make the outbound calls. The effect re-checks both plan
// switches itself, so a sweep and a transition can both call in without
// coordinating.
function dispatch(item, enqueue, transition) {
    const root = item.rootPlanFields();
    if (!shouldDispatch({
        state: item.state,
        executor_type: item.executor_type,
        rootState: root.rootState,
        owningPlanState: root.owningPlanState
    })) {
        return;
    }
    const dispatchItem = {
        work_item: item.reference,
        plan: item.plan,
        short_description: item.short_description,
        description: item.description,
        acceptance_criteria: item.acceptance_criteria,
        executor_type: item.executor_type
    };
    let run;
    try {
        run = prepareRun(dispatchItem, root.startedBy, transition.automaticRetry);
    }
    catch {
        const retry = retryMarkerForCount(transition.automaticRetry?.attempt ?? 0, 'dispatch_failed');
        settleNewestRunOrRecordSystem(item, 'interrupted', DISPATCH_FAILURE_SUMMARY, {
            priorActivityId: transition.automaticRetry?.priorActivityId,
            retry
        });
        enqueue(item.transitionTo('in_progress'));
        transitionAndDrain(() => item.halt(), enqueue);
        return;
    }
    enqueue(item.transitionTo('in_progress'));
    try {
        enqueueRun(run, dispatchItem, root.startedBy, item.dispatchAtfWithApp, item.dispatchAtfWithAppRunUi);
    }
    catch {
        const retry = retryMarkerForCount(transition.automaticRetry?.attempt ?? 0, 'dispatch_failed');
        settleNewestRunOrRecordSystem(item, 'interrupted', DISPATCH_FAILURE_SUMMARY, {
            priorActivityId: transition.automaticRetry?.priorActivityId,
            retry
        });
        transitionAndDrain(() => item.halt(), enqueue);
        return;
    }
    if (!transition.automaticRetry) {
        chargeAssist(AE_WORK_ITEM_EXECUTION_CAPABILITY);
    }
}
// Re-evaluate my direct dependents. Pair-agnostic: the readiness matrix
// (workflow/readiness.ts) decides what the prerequisite's new state means for
// each dependent (a parked prerequisite satisfies same-boundary dependents).
function evaluateDependents(item, enqueue) {
    const graph = graphFor(item.plan_sys_id);
    const dependentIds = [];
    for (const [dependentId, prerequisites] of graph.prerequisites) {
        if (prerequisites.includes(item.sys_id))
            dependentIds.push(dependentId);
    }
    reevaluateWaitingDependents(dependentIds, graph, enqueue);
}
// The delete verb collects dependent ids BEFORE deleting (its edges are gone by
// then) and passes them here with a graph read AFTER; the transition effect
// finds its own dependents. Ids not present in the graph are skipped, not errors.
export function reevaluateWaitingDependents(dependentIds, graph, enqueue) {
    for (const dependentId of dependentIds) {
        if (graph.states.get(dependentId) !== 'waiting')
            continue;
        const dependent = WorkItem.tryLoad(dependentId);
        if (dependent === null)
            continue;
        // Re-check on the LOADED entity, not the snapshot: the graph was read once,
        // so a later dependent may have moved on. Transitioning off a stale read
        // would throw out of the drain AFTER the terminal write committed; skipping
        // is the honest answer — the next trigger re-evaluates from the same facts.
        if (dependent.state !== 'waiting')
            continue;
        const answer = evaluate(dependentId, graph);
        if (answer.answer === 'met')
            enqueue(dependent.transitionTo('ready'));
        else if (answer.answer === 'impossible') {
            settleNewestRunOrRecordSystem(dependent, 'interrupted', answer.summary);
            transitionAndDrain(() => dependent.halt(), enqueue);
        }
    }
}
// ------------------------------------------------------- boundary release
// A plan LANDING terminal is a boundary event: completion releases the
// cross-boundary dependents waiting on this milestone, cancellation makes them
// impossible. Nothing else ever re-fires their readiness.
/**
 * Recompute a plan chain and follow every terminal landing with its boundary
 * release. `enqueue` follows the transitionAndDrain convention: pass it when
 * already inside the pipeline, omit it at top level.
 */
export function recomputePlanChainAndRelease(planId, enqueue) {
    for (const t of recomputePlanChain(planId)) {
        if (t.to === 'completed' || t.to === 'cancelled')
            releaseBoundaryDependents(t.id, enqueue);
    }
}
/**
 * The boundary release for ONE plan that has just landed `completed` or
 * `cancelled` (any other state is a no-op). Completed only: never-activated
 * (started_by empty) sibling sub-plans whose prerequisite milestones are now
 * all completed are activated and their ready items swept — activation runs
 * FIRST so released dependents dispatch through an open gate. Then waiting
 * items OUTSIDE this plan that depend on items INSIDE it are re-evaluated.
 */
export function releaseBoundaryDependents(planId, enqueue) {
    const plan = Plan.tryLoad(planId);
    if (plan === null || (plan.state !== 'completed' && plan.state !== 'cancelled'))
        return;
    const graph = graphFor(planId);
    if (plan.state === 'completed')
        activateEligibleSiblingSubPlans(plan, graph, enqueue);
    const dependentIds = [];
    for (const [dependentId, prerequisites] of graph.prerequisites) {
        if ((graph.itemPlans.get(dependentId) ?? '') === planId)
            continue;
        if (prerequisites.some(p => (graph.itemPlans.get(p) ?? '') === planId))
            dependentIds.push(dependentId);
    }
    if (dependentIds.length === 0)
        return;
    if (enqueue) {
        reevaluateWaitingDependents(dependentIds, graph, enqueue);
        return;
    }
    const queue = [];
    reevaluateWaitingDependents(dependentIds, graph, t => queue.push(t));
    drain(queue, effects);
}
// Late activation of never-activated siblings. Root must be RUNNING — under a
// held root the gate is shut anyway, and Execute/Resume re-runs this filter.
// Activation stamps the ROOT's started_by as the principal; that stamp is the
// persisted "ever activated" bit that keeps this filter (and Execute's) from
// re-activating a plan a human sent backward.
function activateEligibleSiblingSubPlans(plan, graph, enqueue) {
    if (!plan.parent_plan_sys_id)
        return;
    const root = Plan.tryLoad(plan.parent_plan_sys_id);
    if (root === null || root.state !== 'in_progress')
        return;
    for (const child of root.children()) {
        if (child.sys_id === plan.sys_id)
            continue;
        if (child.state !== 'standby' || child.started_by !== '')
            continue;
        if (unmetPrerequisitePlans(child.sys_id, graph).length > 0)
            continue;
        Plan.load(child.sys_id).transitionTo('in_progress', { principal: root.started_by });
        sweepReadyItems(WorkItem.forPlan(child.sys_id), enqueue);
    }
}
// Re-drive ready agent items through the one dispatch effect. This exists
// because an item at `ready` has NO PENDING TRANSITION to hang a side effect
// on: dispatch is the effect of (waiting → ready), so an item that reached
// `ready` while its plan was held has already spent its trigger. The effect
// re-checks executor_type and both plan switches, and the drain re-reads before
// acting, so re-driving an item already being dispatched is a no-op.
export function sweepReadyItems(items, enqueue, options) {
    for (const dto of items) {
        if (dto.state !== 'ready' || dto.executor_type !== 'agent')
            continue;
        const item = WorkItem.tryLoad(dto.sys_id);
        if (item === null)
            continue;
        item.dispatchAtfWithApp = options?.atfWithApp;
        item.dispatchAtfWithAppRunUi = options?.atfWithAppRunUi;
        effects.applyWorkItem('dispatch', item, enqueue ?? (next => drain([next], effects)), {
            aggregate: 'work_item',
            id: item.sys_id,
            from: 'waiting',
            to: 'ready'
        });
    }
}
