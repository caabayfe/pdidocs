/// <reference path="../foundry/glideBridge.d.ts" />
// src/server/domain/checkpoints.ts
// Checkpoint-zero resolution for rollback: the CURRENT execution's conversation
// (the newest 'run' activity, not the item's historical first one — a rolled-back
// item gets re-approved and re-dispatched into a brand-new conversation each
// cycle, so "earliest" would target a stale, already-superseded checkpoint chain
// from a prior rollback cycle instead of the one that's actually live right now),
// and that conversation's Checkpoint 0. This collaborator resolves the conversation
// before delegating restore/eviction decisions to the engine or CheckpointManager.
import { gs } from '@servicenow/glide';
import { CheckpointManager } from '@servicenow/glide/sn_build_agent';
import { getNewestRunActivity } from '../glide/activity.ts';
import * as records from '../glide/records.ts';
import { CheckpointRestoreError } from '../shared/errors.ts';
/**
 * resolveCheckpointZero — an item that never ran (no 'run' activity) has
 * nothing to restore and resolves to null; same for a conversation whose
 * Checkpoint 0 cannot be found (should not happen for a conversation that has
 * run at least once, but CheckpointManager's own contract can still say no).
 */
export function resolveCheckpointZero(workItemId) {
    const run = getNewestRunActivity(workItemId);
    if (!run?.conversation)
        return null;
    const cp0 = CheckpointManager.getInitialCheckpoint(run.conversation);
    if (!cp0)
        return null;
    return { conversationId: run.conversation, cp0SysId: cp0.sys_id };
}
// checkpointManager.js:991-994 returns this exact message when there is
// nothing after the target checkpoint to back out — including when the
// target (CP0) is the item's ONLY checkpoint, i.e. the item ran but produced
// no further checkpoint after CP0. That is semantically identical to a
// never-executed item (cp0 === null): both mean "nothing to undo," so both
// are treated as a no-op SUCCESS rather than a cascade failure. Matched by
// exact string since restoreCheckpoint's contract doesn't give us a
// dedicated error code — traceable back to that source line if the platform
// ever changes the wording.
const NOTHING_TO_RESTORE_MESSAGE = 'No checkpoints to restore. This is already the latest checkpoint.';
export function inspectRestoreProgress(progressId) {
    const gr = records.newRecord('sys_progress_worker');
    if (!progressId || !gr.get(progressId))
        return { status: 'missing', state: '', stateCode: '' };
    const state = String(gr.getValue('state') ?? '').toLowerCase();
    const stateCode = String(gr.getValue('state_code') ?? '').toLowerCase();
    if (state === 'complete' && stateCode === 'success')
        return { status: 'succeeded', state, stateCode };
    if (state === 'complete' || ['unknown', 'cancelled', 'error'].includes(state) || ['cancelled', 'error'].includes(stateCode)) {
        return { status: 'failed', state, stateCode };
    }
    return { status: 'pending', state, stateCode };
}
/**
 * The one destructive step rollback, reopen, and cancel all share: back the
 * item's CURRENT run out to its Checkpoint 0, undoing the agent-authored
 * changes that run produced.
 *
 * Without this, an item that goes back to draft keeps its old artifacts: the
 * re-executed item is dispatched into a BRAND NEW conversation with its own
 * checkpoint chain and update set, so the agent authors a second copy of
 * everything instead of amending the first (DEF0888074 — one rework of a
 * "hello world" UI page left two UI pages on the instance).
 *
 * Throws on a genuine restore failure and resolves silently on a no-op, so the
 * two are never conflated. "No-op" is two cases, deliberately collapsed:
 * `resolveCheckpointZero` answering null (the item never ran) and
 * NOTHING_TO_RESTORE_MESSAGE (it ran but produced no checkpoint after CP0).
 * Both mean "nothing to undo," which is a success for every caller.
 *
 * Callers decide what a THROWN failure means for them — rollback records it in
 * `failed[]`, reopen refuses outright, cancel swallows it — so this deliberately
 * has no opinion about that. It also never touches state; the caller owns the
 * transition.
 *
 * INITIATION ONLY: `restoreCheckpoint` returns once the backout and its
 * post-processing worker are kicked off, not once they finish, and this
 * function does not wait either — it stays fire-and-forget so cancel and
 * automatic retry can coordinate completion without blocking here. Callers
 * that need completion confirmed use `restoreCheckpointZeroConfirmed`.
 */
export function restoreCheckpointZero(workItemId) {
    const cp0 = resolveCheckpointZero(workItemId);
    if (!cp0)
        return {};
    // A refusal and a throw are the same failure to every caller, so they leave
    // here as the same typed error. The message is passed through verbatim in both
    // cases — rollback reports it straight into `failed[].error`.
    let result;
    try {
        result = CheckpointManager.restoreCheckpoint(cp0.cp0SysId, cp0.conversationId);
    }
    catch (e) {
        throw new CheckpointRestoreError(e instanceof Error ? e.message : String(e), workItemId);
    }
    if (result.success) {
        return { backoutProgressId: result.backoutProgressId, postProcessingProgressId: result.postProcessingProgressId };
    }
    if (result.message === NOTHING_TO_RESTORE_MESSAGE)
        return {};
    // restoreCheckpoint's `{success:false}` branches always carry a message; the
    // fallback exists so a future one that does not still produces a reportable
    // error rather than `undefined`.
    throw new CheckpointRestoreError(result.message || 'the platform could not back out the run', workItemId);
}
export function confirmRestoreProgress(progressId, workItemId) {
    let confirmed;
    try {
        confirmed = CheckpointManager.waitForRestoreCompletion(progressId);
    }
    catch {
        throw new CheckpointRestoreError('Could not confirm the restore completed successfully', workItemId);
    }
    if (!confirmed.success) {
        throw new CheckpointRestoreError('Could not confirm the restore completed successfully', workItemId);
    }
}
// CONFIRMED, not just initiated — wraps restoreCheckpointZero above with a wait
// on CheckpointManager.waitForRestoreCompletion so a backout that hits a
// superseded version, an unsafe field change, a data-loss guard, or any other
// runtime failure surfaces HERE as a throw, instead of leaving the update set
// stuck 'complete' after this had already reported success and the caller had
// already transitioned the work item. Reopen and rollback use this; cancel and
// automatic retry keep their separate non-blocking continuation paths.
//
// KNOWN TRADEOFF: a merely-slow restore that would have succeeded past that
// wait's own timeout is indistinguishable here from a genuine failure — both
// throw. The background work is not cancelled by the timeout, so it can still
// complete successfully afterward with nothing watching, while the work item
// was already left untransitioned.
export function restoreCheckpointZeroConfirmed(workItemId) {
    const outcome = restoreCheckpointZero(workItemId);
    // restoreCheckpoint always carries this whenever a backout was actually
    // initiated (checkpointManager.js:1044-1049) — absent only for a no-op
    // (outcome === {}), which never reaches this branch below.
    if (!outcome.backoutProgressId)
        return outcome;
    if (!outcome.postProcessingProgressId) {
        gs.warn(`[build-agent] restoreCheckpointZero: missing postProcessingProgressId for ${workItemId} — skipping completion wait`);
        return outcome;
    }
    confirmRestoreProgress(outcome.postProcessingProgressId, workItemId);
    return outcome;
}
/**
 * evictPendingCheckpoint — same "resolve against the CURRENT run's conversation"
 * step resolveCheckpointZero uses above, for the same reason: an item re-run
 * after a prior cycle must evict against its current run, not a stale one. An
 * item that never ran (no 'run' activity, or a run with no conversation) has
 * nothing to evict and resolves to null.
 */
export function evictPendingCheckpoint(workItemId) {
    const run = getNewestRunActivity(workItemId);
    if (!run?.conversation)
        return null;
    return CheckpointManager.evictPendingWork(run.conversation);
}
export function evictPendingCheckpointForDelete(workItemId) {
    const run = getNewestRunActivity(workItemId);
    if (!run?.conversation)
        return null;
    return CheckpointManager.evictPendingWorkForDelete(run.conversation);
}
