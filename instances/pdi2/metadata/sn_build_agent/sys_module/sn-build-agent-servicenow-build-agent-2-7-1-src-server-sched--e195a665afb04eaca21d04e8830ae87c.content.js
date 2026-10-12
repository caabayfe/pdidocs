/// <reference path="../foundry/glideBridge.d.ts" />
import { GlideDateTime, gs } from '@servicenow/glide';
import { configuredRetryCap, triggerMatchesOutcome } from '../domain/automaticRetry.ts';
import { inspectRestoreProgress, restoreCheckpointZero } from '../domain/checkpoints.ts';
import { WorkItem } from '../domain/workItem.ts';
import { effects } from '../engine/effects.ts';
import * as activity from '../glide/activity.ts';
import { drain } from '../workflow/drain.ts';
const LOG = '[sn_build_agent.AutomaticWorkItemRetry] ';
const RETRY_BATCH_PROPERTY = 'sn_build_agent.implementation_job_monitor.retry_max_per_run';
const DEFAULT_RETRY_BATCH = 20;
const MAX_RETRY_BATCH = 100;
const CLAIM_SECONDS = 300;
const RESTORE_SECONDS = 300;
export function configuredRetryBatchLimit() {
    const raw = gs.getProperty(RETRY_BATCH_PROPERTY, String(DEFAULT_RETRY_BATCH)).trim();
    if (!raw)
        return DEFAULT_RETRY_BATCH;
    const parsed = Number(raw);
    if (!Number.isInteger(parsed))
        return DEFAULT_RETRY_BATCH;
    return Math.min(MAX_RETRY_BATCH, Math.max(0, parsed));
}
function emptyRetrySummary() {
    return {
        retryScanned: 0,
        restoreStarted: 0,
        retryDispatched: 0,
        retryCompleted: 0,
        retryFailed: 0,
        retrySuperseded: 0,
        retryExhausted: 0,
        retryErrors: []
    };
}
function nowValue() {
    return new GlideDateTime().getValue();
}
function plusSeconds(value, seconds) {
    const shifted = new GlideDateTime(value);
    shifted.addSeconds(seconds);
    return shifted.getValue();
}
function logPhase(row, phase, code, level = 'info') {
    const message = LOG +
        `phase=${phase} code=${code} workItem=${row.work_item} activity=${row.id} trigger=${row.retry_trigger || 'none'} retryCount=${row.retry_count ?? 'unknown'} progress=${row.retry_restore_progress || 'none'}`;
    if (level === 'warn')
        gs.warn(message);
    else
        gs.info(message);
}
function noteTerminal(row, status, code, summary) {
    if (status === 'completed')
        summary.retryCompleted++;
    else if (status === 'failed')
        summary.retryFailed++;
    else if (status === 'superseded')
        summary.retrySuperseded++;
    else
        summary.retryExhausted++;
    if (status === 'failed')
        summary.retryErrors.push({ activityId: row.id, code });
    logPhase(row, 'terminal', code, status === 'failed' ? 'warn' : 'info');
}
function finishClaimed(row, token, status, code, summary) {
    const finished = activity.updateClaimedRetry({
        id: row.id,
        from: row.retry_status,
        to: status,
        token,
        clearClaim: true
    });
    if (finished)
        noteTerminal(finished, status, code, summary);
}
function finishUnclaimed(row, status, code, summary) {
    const finished = activity.transitionRetryActivity({
        id: row.id,
        from: row.retry_status,
        to: status,
        clearClaim: true
    });
    if (finished)
        noteTerminal(finished, status, code, summary);
}
function finishFailed(row, token, code, summary) {
    finishClaimed(row, token, 'failed', code, summary);
}
function validateRequest(candidate) {
    const failed = activity.getActivityById(candidate.id);
    if (!failed)
        return { kind: 'missing' };
    const successors = activity.listActivitySuccessors(failed.work_item, failed.id);
    if (successors.length > 1)
        return { kind: 'terminal', status: 'failed', code: 'ambiguous_successors' };
    if (successors.length === 1) {
        const successor = successors[0];
        if (successor.kind === 'run' || successor.kind === 'system') {
            return { kind: 'terminal', status: 'completed', code: 'replacement_successor' };
        }
        if (successor.kind === 'chat')
            return { kind: 'terminal', status: 'superseded', code: 'user_successor' };
        return { kind: 'terminal', status: 'failed', code: 'invalid_successor_kind' };
    }
    const validKind = (failed.retry_trigger === 'agent_blocked' && failed.kind === 'run') ||
        (failed.retry_trigger === 'dispatch_failed' && (failed.kind === 'run' || failed.kind === 'system'));
    if (!validKind || !failed.retry_trigger || !triggerMatchesOutcome(failed.retry_trigger, failed.outcome)) {
        return { kind: 'terminal', status: 'failed', code: 'invalid_trigger' };
    }
    const depth = activity.automaticRetryDepth(failed);
    if (depth === null || failed.retry_count === null || depth !== failed.retry_count) {
        return { kind: 'terminal', status: 'failed', code: 'invalid_lineage' };
    }
    if (depth >= configuredRetryCap())
        return { kind: 'terminal', status: 'exhausted', code: 'cap_exhausted' };
    const item = WorkItem.tryLoad(failed.work_item);
    if (!item || item.executor_type !== 'agent' || item.state !== 'needs_attention') {
        return { kind: 'terminal', status: 'superseded', code: 'state_changed' };
    }
    const root = item.rootPlanFields();
    if (root.rootState !== 'in_progress' || root.owningPlanState !== 'in_progress') {
        return { kind: 'terminal', status: 'superseded', code: 'plan_not_running' };
    }
    return { kind: 'eligible', failed, item };
}
function finishValidation(row, token, validation, summary) {
    if (validation.kind === 'missing')
        return;
    finishClaimed(row, token, validation.status, validation.code, summary);
}
function processCandidates(candidates, remaining, summary, process) {
    for (const row of candidates) {
        if (remaining === 0)
            break;
        remaining--;
        summary.retryScanned++;
        try {
            process(row);
        }
        catch {
            summary.retryErrors.push({ activityId: row.id, code: 'unexpected_processing_error' });
            logPhase(row, 'processing', 'unexpected_processing_error', 'warn');
        }
    }
    return remaining;
}
function processPending(candidate, now, summary) {
    const token = gs.generateGUID();
    const claimed = activity.claimRetryActivity({
        id: candidate.id,
        from: 'pending',
        to: 'restore_starting',
        token,
        now,
        claimUntil: plusSeconds(now, CLAIM_SECONDS)
    });
    if (!claimed)
        return;
    const validation = validateRequest(claimed);
    if (validation.kind !== 'eligible')
        return finishValidation(claimed, token, validation, summary);
    let restore;
    try {
        restore = restoreCheckpointZero(validation.item.sys_id);
    }
    catch {
        finishFailed(claimed, token, 'restore_initiation_failed', summary);
        return;
    }
    if (!restore) {
        finishFailed(claimed, token, 'restore_initiation_failed', summary);
        return;
    }
    if (!restore.backoutProgressId && !restore.postProcessingProgressId) {
        const dispatching = activity.updateClaimedRetry({ id: claimed.id, from: 'restore_starting', token, to: 'dispatching' });
        if (dispatching)
            continueRetryRequest(dispatching, token, summary);
        return;
    }
    if (!restore.postProcessingProgressId) {
        gs.warn(LOG +
            `phase=restore code=restore_progress_missing workItem=${claimed.work_item} activity=${claimed.id} trigger=${claimed.retry_trigger || 'none'} retryCount=${claimed.retry_count ?? 'unknown'} backoutProgressId=${restore.backoutProgressId}`);
        finishFailed(claimed, token, 'restore_progress_missing', summary);
        return;
    }
    const restoring = activity.updateClaimedRetry({
        id: claimed.id,
        from: 'restore_starting',
        token,
        to: 'restoring',
        restoreProgress: restore.postProcessingProgressId,
        restoreDeadline: plusSeconds(now, RESTORE_SECONDS),
        clearClaim: true
    });
    if (!restoring)
        return;
    summary.restoreStarted++;
    logPhase(restoring, 'restore', 'restore_started');
}
function processRestoring(row, now, summary) {
    const progress = inspectRestoreProgress(row.retry_restore_progress);
    const timedOut = !row.retry_restore_deadline || row.retry_restore_deadline <= now;
    if (progress.status === 'failed') {
        finishUnclaimed(row, 'failed', 'restore_progress_failed', summary);
        return;
    }
    if ((progress.status === 'pending' || progress.status === 'missing') && timedOut) {
        finishUnclaimed(row, 'failed', progress.status === 'missing' ? 'restore_progress_missing' : 'restore_progress_timeout', summary);
        return;
    }
    if (progress.status !== 'succeeded')
        return;
    const token = gs.generateGUID();
    const claimed = activity.claimRetryActivity({
        id: row.id,
        from: 'restoring',
        to: 'dispatching',
        token,
        now,
        claimUntil: plusSeconds(now, CLAIM_SECONDS)
    });
    if (claimed)
        continueRetryRequest(claimed, token, summary);
}
function failStaleRestoreStart(row, summary) {
    finishUnclaimed(row, 'failed', 'restore_start_incomplete', summary);
}
function reconcileDispatching(row, now, summary) {
    const token = gs.generateGUID();
    const claimed = activity.claimRetryActivity({
        id: row.id,
        from: 'dispatching',
        to: 'dispatching',
        token,
        now,
        claimUntil: plusSeconds(now, CLAIM_SECONDS)
    });
    if (!claimed)
        return;
    const validation = validateRequest(claimed);
    if (validation.kind === 'eligible') {
        continueRetryRequest(claimed, token, summary);
        return;
    }
    if (validation.kind === 'terminal' && validation.code === 'state_changed') {
        const item = WorkItem.tryLoad(claimed.work_item);
        if (item && item.executor_type === 'agent' && item.state !== 'needs_attention') {
            finishFailed(claimed, token, 'dispatch_state_ambiguous', summary);
            return;
        }
    }
    finishValidation(claimed, token, validation, summary);
}
export function continueRetryRequest(claimed, token, summary) {
    const owned = activity.getActivityById(claimed.id);
    if (!owned || owned.retry_status !== 'dispatching' || owned.retry_claim_token !== token)
        return;
    const validation = validateRequest(owned);
    if (validation.kind !== 'eligible') {
        finishValidation(owned, token, validation, summary);
        return;
    }
    const automaticRetry = {
        priorActivityId: validation.failed.id,
        attempt: validation.failed.retry_count + 1,
        trigger: validation.failed.retry_trigger
    };
    try {
        const toDraft = { ...validation.item.reopen(), automaticRetry };
        const toWaiting = { ...validation.item.approve(), automaticRetry };
        drain([toDraft, toWaiting], effects);
    }
    catch {
        logPhase(owned, 'dispatch', 'dispatch_incomplete', 'warn');
        return;
    }
    summary.retryDispatched++;
    logPhase(owned, 'dispatch', 'retry_dispatched');
    const freshValidation = validateRequest(owned);
    if (freshValidation.kind === 'terminal')
        finishValidation(owned, token, freshValidation, summary);
}
function reconcileTerminalClaimResidue(limit) {
    for (const row of activity.listTerminalRetryClaims(limit)) {
        try {
            activity.clearTerminalRetryClaim({
                id: row.id,
                status: row.retry_status,
                token: row.retry_claim_token
            });
        }
        catch {
            logPhase(row, 'terminal_claim_cleanup', 'terminal_claim_cleanup_failed', 'warn');
        }
    }
}
export function runRetryRequests() {
    const summary = emptyRetrySummary();
    const limit = configuredRetryBatchLimit();
    let remaining = limit;
    if (remaining === 0)
        return summary;
    const now = nowValue();
    remaining = processCandidates(activity.listRetryActivities('restoring', remaining), remaining, summary, row => processRestoring(row, now, summary));
    remaining = processCandidates(activity.listExpiredRetryActivities('restore_starting', now, remaining), remaining, summary, row => failStaleRestoreStart(row, summary));
    remaining = processCandidates(activity.listExpiredRetryActivities('dispatching', now, remaining), remaining, summary, row => reconcileDispatching(row, now, summary));
    processCandidates(activity.listRetryActivities('pending', remaining), remaining, summary, row => processPending(row, now, summary));
    reconcileTerminalClaimResidue(limit);
    return summary;
}
