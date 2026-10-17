// src/server/engine/workItems.ts
// The work-item barrel layer: thin wrappers over the WorkItem entity that preserve
// the frozen public signatures (adapters/SIs/e2e never move). All decisions +
// persistence live on the entity (domain/workItem.ts); this file is
// transport-adjacent glue only.
//
// Wrapper shape: load the entity first, so a missing item returns not-found before
// any state guard can report a conflict.
import * as activity from '../glide/activity.ts';
import * as verbs from './verbs.ts';
import { WorkItem } from '../domain/workItem.ts';
import { Plan } from '../domain/plan.ts';
import { settleNewestRunOrRecordSystem, startHumanRun } from './activityOutcomes.ts';
import { recomputePlanChainAndRelease, transitionAndDrain } from './effects.ts';
import { planReferenceFromSysId, workItemReferenceFromSysId } from '../domain/recordReferences.ts';
function activityDto(row) {
    return {
        sys_id: row.id,
        conversation: row.conversation || null,
        kind: row.kind,
        outcome: row.outcome || null,
        summary: row.summary,
        plan: planReferenceFromSysId(row.plan),
        work_item: row.work_item ? workItemReferenceFromSysId(row.work_item) : null,
        prior_activity: row.prior_activity || null,
        created: row.created
    };
}
function workItemDto(item) {
    return item.toDto({ latestActivity: activity.getNewestSettledActivity(item.sys_id) });
}
export function createWorkItem(input) {
    const item = WorkItem.create(input);
    // Membership changed with no transition to hang an effect on (creation is the
    // null → draft pre-existence edge, which carries no effects), so the plan
    // chain recomputes here: a new draft member under an in_review plan regresses
    // it to standby — there is now work to do. Under every other plan state the
    // rollup proposes nothing (creation can never land a plan terminal, so the
    // release half is a documented no-op — one entry point keeps every membership
    // mutation on the same path). Terminal plans were already refused inside
    // WorkItem.create.
    recomputePlanChainAndRelease(item.plan_sys_id);
    return workItemDto(item);
}
export function getWorkItem(id) {
    const wi = WorkItem.tryLoad(id);
    if (!wi)
        return null;
    return {
        ...workItemDto(wi),
        work_notes: wi.work_notes,
        activities: activity.listActivityForWorkItem(wi.sys_id).map(activityDto),
        update_sets: wi.updateSets()
    };
}
export function getWorkItemByNumber(number) {
    const workItem = WorkItem.resolve({ number });
    return getWorkItem(workItem.sys_id);
}
export function listWorkItems(planId) {
    // Subtree-scoped for a root so the list matches item_counts. The Plan
    // entity owns the root/sub decision (mirrors itemCounts). tryLoad, not load:
    // a missing plan row is a best-effort empty/direct read (preserves the prior
    // contract — listWorkItems never threw plan-not-found), not a 404.
    const plan = Plan.tryLoad(planId);
    return plan ? plan.workItems() : WorkItem.forPlan(planId);
}
// This work item's own file attachments, projected as artifacts. A plain read with
// no cross-aggregate orchestration — `WorkItem.load` supplies the 404 for a missing
// item, `artifacts()` supplies the rows.
export function listWorkItemArtifacts(id) {
    return WorkItem.load(id).artifacts();
}
// approve — the spec agent's assertion that the item is
// specified well enough to run. It lands `waiting` ALWAYS; readiness and dispatch
// are the transition's side effects, run by the drain. The DTO is re-read after the
// cascade so the caller sees where the item actually ENDED (ready, in_progress, or
// still waiting) rather than the intermediate write.
export function approve(id) {
    verbs.approve(id);
    return workItemDto(WorkItem.load(id));
}
export function execute(id, _principal) {
    const item = WorkItem.load(id);
    item.assertCanExecute();
    startHumanRun(item);
    transitionAndDrain(() => item.execute());
    return workItemDto(item);
}
export function finish(id) {
    const item = WorkItem.load(id);
    item.assertCanFinish();
    settleNewestRunOrRecordSystem(item, 'done', 'Completed by a user.');
    transitionAndDrain(() => item.finish());
    return workItemDto(item);
}
// accept — the Builder judges the delivered work good. Per-item accept is a
// first-class review act: any parked item may be accepted here, gated only by
// the accept door's own guard (the foundation guard — engine/verbs.ts). The
// caller's principal is forwarded so the verb records the "Accepted by" audit
// row. The `→ completed` side effect recomputes the plan, so the DTO is
// re-read after the cascade for the same reason approve's is.
export function accept(id, principal) {
    verbs.accept(id, principal);
    return workItemDto(WorkItem.load(id));
}
// reopen is the one verb whose result carries more than the DTO: the rework chat the
// engine just created, so the client can OPEN it (that is what removes the manual
// "new chat, tick spec mode, paste the item id" steps). The DTO half is preserved
// because the pane refreshes its whole render from it. The DTO is re-read after the
// verb so it shows where the item actually ended.
export function reopen(id, principal) {
    const { activity: reworkActivity } = verbs.reopen(id, principal);
    return {
        work_item: workItemDto(WorkItem.load(id)),
        rework_activity: activityDto(reworkActivity)
    };
}
export function stop(id) {
    verbs.stop(id);
    return workItemDto(WorkItem.load(id));
}
export function cancel(id) {
    verbs.cancel(id);
    return workItemDto(WorkItem.load(id));
}
export function updateWorkItem(id, fields) {
    const { testing_criteria, ...content } = fields;
    const item = WorkItem.load(id);
    // Legacy Spec clients can still send testing_criteria. Normalize it
    // at the boundary so the table and outbound contract have one definition of done.
    if (testing_criteria?.trim()) {
        const acceptance = content.acceptance_criteria === undefined ? item.acceptance_criteria : content.acceptance_criteria;
        const parts = [acceptance, testing_criteria].map(value => value?.trim()).filter((value) => !!value);
        content.acceptance_criteria = [...new Set(parts)].join('\n');
    }
    item.updateContent(content);
    return workItemDto(item);
}
// previewRollback/rollback report on MULTIPLE items, not one — there is no
// single WorkItemDto to re-read and return here, unlike every other verb
// wrapper in this file. verbs.ts already produces the exact final response
// shape, so this wrapper is a straight pass-through, kept only so adapters
// continue to import exclusively from this barrel (workItems.ts/index.ts),
// never from engine/verbs.ts directly.
export function previewRollback(id, maxDepth) {
    return verbs.previewRollback(id, maxDepth);
}
export function rollback(id, reason, maxDepth) {
    return verbs.rollback(id, reason, maxDepth);
}
// deleteWorkItem — pass-through to the verb, kept here for the same reason
// previewRollback/rollback are: adapters import exclusively from this barrel
// (workItems.ts/index.ts), never from engine/verbs.ts directly. Returns nothing —
// the row is gone, so there is no DTO left to re-read.
export function deleteWorkItem(id) {
    verbs.deleteItem(id);
}
