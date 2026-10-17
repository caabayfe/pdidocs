// src/server/engine/events.ts
// The run-event resolver: correlates report_outcome back to a work item through
// the conversation the run was started on, then delegates the row transition to
// the WorkItem entity. Job status never settles work-item state: a speaking worker
// declares its result here. The message-stream watchdog is the fast-follow for a
// stalled worker; until it lands, a person must use Stop.
import * as activity from '../glide/activity.ts';
import { WorkItem } from '../domain/workItem.ts';
import { ValidationError } from '../shared/errors.ts';
import { retryMarkerForActivity } from '../domain/automaticRetry.ts';
import { settleRun } from './activityOutcomes.ts';
import { transitionAndDrain } from './effects.ts';
// The newest-run fence: true iff this conversation's activity row is the item's
// newest 'run' row. Reused by report_outcome (reject a stale run's settle attempt)
// and by reopen's re-dispatch. A conversation with no run row / no work item is
// never current.
export function isCurrentRun(conversationId) {
    const row = activity.getActivityByConversation(conversationId);
    if (!row || row.kind !== 'run' || !row.work_item)
        return false;
    const newest = activity.getNewestRunActivity(row.work_item);
    return !!newest && newest.id === row.id;
}
// The execution agent's terminal transition, called synchronously by the
// report_outcome tool. Proceeds only if the item is still in_progress AND this
// conversation is the item's NEWEST run (fences a zombie turn racing a reopen). `done`
// settles the run activity before moving to in_review; `blocked` settles it before
// moving to needs_attention.
// Exactly two outcomes; an unknown one throws (adapter-mapped to 400). Reporting is
// already the terminal operation, so this request must not cancel its own Foundry turn
// before the caller can observe the successful response.
export function onReportOutcome(conversationId, input) {
    if (input.outcome !== 'done' && input.outcome !== 'blocked') {
        throw new ValidationError(`report_outcome: unknown outcome '${input.outcome}' (must be 'done' or 'blocked')`);
    }
    const row = activity.getActivityByConversation(conversationId);
    const wi = resolveRunItem(row);
    if (!wi || wi.state !== 'in_progress')
        return;
    if (!isCurrentRun(conversationId))
        return;
    const retry = input.outcome === 'blocked' ? retryMarkerForActivity(row, 'agent_blocked') : undefined;
    settleRun(row, input.outcome, input.summary, retry);
    transitionAndDrain(() => (input.outcome === 'done' ? wi.reviewFromRun() : wi.blockedByAgent()));
}
// Resolve a conversation → its run activity row → the WorkItem it ran. Returns null
// for no correlating row, a chat row, a run with no work item, or an item that no
// longer resolves — every one a silent drop (identical to the pre-entity behaviour).
function resolveRunItem(row) {
    if (!row || row.kind !== 'run' || !row.work_item)
        return null;
    return WorkItem.tryLoad(row.work_item);
}
