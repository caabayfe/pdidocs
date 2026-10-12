import * as activity from '../glide/activity.ts';
function requireActivity(row, message) {
    if (!row)
        throw new Error(message);
    return row;
}
export function startHumanRun(item) {
    return requireActivity(activity.insertActivity({ kind: 'run', plan: item.plan_sys_id, work_item: item.sys_id }), `could not create a human run activity for ${item.number}`);
}
export function settleRun(row, outcome, summary, retry) {
    return requireActivity(activity.settleActivity(row.id, outcome, summary, retry), `could not settle activity ${row.id}`);
}
// Settle the open run when one exists. Engine events that happen before a run was
// created are still durable, but are represented honestly as system activities.
export function settleNewestRunOrRecordSystem(item, outcome, summary, options = {}) {
    const run = activity.getNewestRunActivity(item.sys_id);
    if (run && !run.outcome)
        return settleRun(run, outcome, summary, options.retry);
    return requireActivity(activity.insertActivity({
        kind: 'system',
        plan: item.plan_sys_id,
        work_item: item.sys_id,
        outcome,
        summary,
        retry: options.retry,
        ...(options.priorActivityId && { prior_activity: options.priorActivityId })
    }), `could not record a system activity for ${item.number}`);
}
