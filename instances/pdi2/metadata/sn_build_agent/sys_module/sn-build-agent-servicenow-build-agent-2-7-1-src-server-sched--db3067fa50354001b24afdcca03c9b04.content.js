// src/server/scheduled-scripts/implementationJobsMonitor.ts
//
// ImplementationJobsMonitor — the stall watchdog for build-agent work items,
// documented in docs/autoeng/resiliency.md. A speaking worker declares its
// result through report_outcome (see engine/events.ts's header comment); a
// worker that never starts or crashes mid-turn cannot. This watchdog supplies
// that missing signal on a schedule instead of relying on a person to press Stop.
//
// Detection uses exactly one signal, nothing else: work items with
// state=in_progress whose newest run conversation has gone quiet — no new
// message for stall_threshold_sec, measured from the run's dispatch time when
// no message has arrived yet — get interrupted. Not a heartbeat, not a
// job-status fallback, not a new product state; see docs/autoeng/resiliency.md.
//
// A watchdog-interrupted run remains stopped and never enters the automatic-
// retry coordinator. The watchdog still settles the observed run and attempts
// cancellation of that run's Foundry turn. Human/conversationless runs remain
// outside the watchdog, and user Stop/Cancel use separate verb paths.
// The work item's own lifecycle stays decoupled from Foundry either way — this
// watchdog does not reach into Foundry's job ledger.
//
// Design constraints (engine anti-patterns, unchanged from the file this
// replaces): no Promise/async-await, no dynamic import(), no unsupported
// Node.js builtins. The domain/engine modules imported below are already
// plain synchronous GlideRecord code, so calling them directly here doesn't
// cross that line.
//
// To disable without deleting: set sn_build_agent.implementation_job_monitor.enabled = false.
import { gs, GlideDateTime } from '@servicenow/glide';
import * as records from '../glide/records.ts';
import * as activity from '../glide/activity.ts';
import * as runs from '../domain/runs.ts';
import * as foundry from '../foundry/client.ts';
import { WorkItem } from '../domain/workItem.ts';
import { settleNewestRunOrRecordSystem } from '../engine/activityOutcomes.ts';
import { transitionAndDrain } from '../engine/effects.ts';
import { STATE } from '../shared/states.ts';
import { runRetryRequests } from './retryRunner.ts';
const LOG = '[sn_build_agent.ImplementationJobsMonitor] ';
const PROP = {
    ENABLED: 'sn_build_agent.implementation_job_monitor.enabled',
    STALL_THRESHOLD_SEC: 'sn_build_agent.implementation_job_monitor.stall_threshold_sec',
    MAX_PER_RUN: 'sn_build_agent.implementation_job_monitor.max_per_run'
};
function failedRetrySummary() {
    return {
        retryScanned: 0,
        restoreStarted: 0,
        retryDispatched: 0,
        retryCompleted: 0,
        retryFailed: 0,
        retrySuperseded: 0,
        retryExhausted: 0,
        retryErrors: [{ activityId: '', code: 'retry_task_failed' }]
    };
}
function safeRunRetryRequests() {
    try {
        return runRetryRequests();
    }
    catch {
        gs.error(LOG + 'retry task failed code=retry_task_failed');
        return failedRetrySummary();
    }
}
/**
 * run — entry point for the scheduled script execution. Processes durable retry
 * requests first, then finds in_progress work items whose newest run has gone
 * quiet past the threshold and interrupts them. The two concerns retain
 * independent limits and are returned in one flat summary.
 */
export function run() {
    if (gs.getProperty(PROP.ENABLED, 'true') !== 'true') {
        gs.info(LOG + 'disabled via ' + PROP.ENABLED + '; skipping run');
        return;
    }
    const retrySummary = safeRunRetryRequests();
    const maxPerRun = parseInt(gs.getProperty(PROP.MAX_PER_RUN, '50'), 10);
    const stallThresholdSec = parseInt(gs.getProperty(PROP.STALL_THRESHOLD_SEC, '900'), 10);
    // GlideDateTime's own UTC string representation (getValue(), the same
    // "yyyy-MM-dd HH:mm:ss" format every DateTimeColumn.getValue() returns) sorts
    // lexically in chronological order — plain string comparison against it below,
    // no numeric parsing needed.
    const cutoff = new GlideDateTime();
    cutoff.addSeconds(-stallThresholdSec);
    const cutoffValue = String(cutoff.getValue());
    const summary = {
        ...retrySummary,
        scanned: 0,
        interrupted: 0,
        skipped: 0,
        errors: [],
        cancelFailures: []
    };
    for (const candidate of _findStalled(cutoffValue, maxPerRun, summary)) {
        _interrupt(candidate, cutoffValue, stallThresholdSec, summary);
    }
    // Scanning alone is not logged for either concern. A normal pass that only
    // inspects retry requests and/or fresh watchdog items is intentionally quiet.
    // Log only when either concern performs an action or records a failure.
    const retryActed = summary.restoreStarted > 0 ||
        summary.retryDispatched > 0 ||
        summary.retryCompleted > 0 ||
        summary.retryFailed > 0 ||
        summary.retrySuperseded > 0 ||
        summary.retryExhausted > 0;
    if (retryActed || summary.retryErrors.length > 0 || summary.interrupted > 0 || summary.errors.length > 0 || summary.cancelFailures.length > 0) {
        gs.info(LOG +
            'run complete — scanned=' +
            summary.scanned +
            ' interrupted=' +
            summary.interrupted +
            ' skipped=' +
            summary.skipped +
            ' retryScanned=' +
            summary.retryScanned +
            ' restoreStarted=' +
            summary.restoreStarted +
            ' retryDispatched=' +
            summary.retryDispatched +
            ' retryCompleted=' +
            summary.retryCompleted +
            ' retryFailed=' +
            summary.retryFailed +
            ' retrySuperseded=' +
            summary.retrySuperseded +
            ' retryExhausted=' +
            summary.retryExhausted +
            (summary.retryErrors.length ? ' retryErrors=' + JSON.stringify(summary.retryErrors) : '') +
            (summary.errors.length ? ' errors=' + JSON.stringify(summary.errors) : '') +
            (summary.cancelFailures.length ? ' cancelFailures=' + JSON.stringify(summary.cancelFailures) : ''));
    }
    return summary;
}
/**
 * _findStalled — every in_progress work item whose newest run conversation's
 * last_message_at is older than cutoffValue. A conversation that has never
 * received a message at all (blank last_message_at) still counts as stale
 * eventually, not skipped forever — a worker that never starts is one of the
 * current watchdog cases documented in docs/autoeng/resiliency.md#detection.
 * This case gets the same stallThresholdSec grace period as a talkative one,
 * measured from the run activity's own
 * sys_created_on (set at dispatch time, in dispatcher.ts's prepareRun(),
 * before any worker message). Without this fallback, a work item scanned in
 * the seconds between dispatch and its first message would be flagged
 * stalled immediately, regardless of stallThresholdSec — that was the bug.
 *
 * Bounded by maxPerRun via setLimit on the candidate query itself — this caps
 * not just how many items get SCANNED, but consequently how many can be
 * INTERRUPTED in this same pass too: a candidate past the limit is never
 * read, so run()'s later loop over the returned candidates cannot act on it
 * either. In a burst (e.g. many items going stale at once from a Foundry
 * outage), maxPerRun is the real ceiling on interrupts-per-run, not just
 * scans-per-run. Remaining candidates are caught on the next run.
 */
function _findStalled(cutoffValue, maxPerRun, summary) {
    const stalled = [];
    const gr = records.newRecord('sn_build_agent_work_item');
    gr.addQuery('state', String(STATE.IN_PROGRESS));
    gr.setLimit(maxPerRun);
    gr.query();
    while (gr.next()) {
        summary.scanned++;
        const workItemId = String(gr.getUniqueValue());
        const newestRun = activity.getNewestRunActivity(workItemId);
        if (!newestRun?.conversation) {
            // Dispatched but no run activity/conversation yet — nothing to watch.
            summary.skipped++;
            continue;
        }
        const lastMessageAt = runs.conversationLastMessageAt(newestRun.conversation);
        const staleSince = lastMessageAt || newestRun.created;
        if (staleSince >= cutoffValue) {
            summary.skipped++;
            continue;
        }
        stalled.push({ workItemId, runActivityId: newestRun.id });
    }
    return stalled;
}
/**
 * _interrupt — revalidate the scanned run and its liveness at the action
 * boundary, settle that run, move the item to needs_attention, then cancel its
 * Foundry turn. Watchdog interruption never starts a replacement; successful or
 * failed cancellation leaves the stopped item visible for intervention.
 */
function _interrupt(candidate, cutoffValue, stallThresholdSec, summary) {
    const workItemId = candidate.workItemId;
    try {
        const item = WorkItem.tryLoad(workItemId);
        if (!item || item.state !== 'in_progress') {
            summary.skipped++;
            return;
        }
        const principal = item.dispatchPrincipal();
        const newestRun = activity.getNewestRunActivity(item.sys_id);
        if (!newestRun?.conversation || newestRun.id !== candidate.runActivityId) {
            summary.skipped++;
            return;
        }
        const lastMessageAt = runs.conversationLastMessageAt(newestRun.conversation);
        const staleSince = lastMessageAt || newestRun.created;
        if (staleSince >= cutoffValue) {
            summary.skipped++;
            return;
        }
        settleNewestRunOrRecordSystem(item, 'interrupted', `No activity on this run for over ${Math.floor(stallThresholdSec / 60)} minutes — interrupted by the stall watchdog.`);
        transitionAndDrain(() => item.interrupted());
        gs.info(LOG + 'interrupted workItem=' + workItemId + ' conversation=' + newestRun.conversation);
        const cancelled = foundry.cancelTurn(newestRun.conversation, principal);
        if (!cancelled) {
            gs.warn(LOG + 'cancelTurn failed for workItem=' + workItemId + ' conversation=' + newestRun.conversation);
            summary.cancelFailures.push({ workItemId, conversation: newestRun.conversation });
        }
        summary.interrupted++;
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        gs.error(LOG + '_interrupt: unexpected error for workItem=' + workItemId + ': ' + message);
        summary.errors.push({ workItemId, error: message });
    }
}
