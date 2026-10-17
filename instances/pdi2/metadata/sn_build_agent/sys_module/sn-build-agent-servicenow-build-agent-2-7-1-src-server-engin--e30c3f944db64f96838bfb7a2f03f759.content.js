/// <reference path="../foundry/glideBridge.d.ts" />
// src/server/engine/verbs.ts
// The REST-facing work-item verbs. Each is the same four steps:
//
//     load -> guard -> transition -> drain
//
// The verb never performs the transition's declared effect itself; the drain binds
// that effect to its engine implementation.
//
// `reopen` is the one exception, and only in what it adds: it restores Checkpoint 0
// and creates the rework conversation BETWEEN the guard and the transition, and
// returns the conversation's id. Its reasons are on the function.
import * as activity from '../glide/activity.ts';
import * as foundry from '../foundry/client.ts';
import { insertConversation } from '../glide/conversationRecord.ts';
import { insertAssistantMessage } from '../glide/messageRecord.ts';
import { WorkItem } from '../domain/workItem.ts';
import { canReopen, REOPEN_ILLEGAL_STATE } from '../shared/statePolicy.ts';
import { label } from '../shared/label.ts';
import { InvalidStateError } from '../shared/errors.ts';
import { drain } from '../workflow/drain.ts';
import { effects, recomputePlanChainAndRelease, reevaluateWaitingDependents, transitionAndDrain } from './effects.ts';
import { settleNewestRunOrRecordSystem } from './activityOutcomes.ts';
import { dependentIdsOf, graphFor } from '../domain/dependencies.ts';
import { computeRollbackOrder } from '../workflow/rollbackCascade.ts';
import { foundationBlocker } from '../workflow/foundation.ts';
import { confirmRestoreProgress, evictPendingCheckpoint, evictPendingCheckpointForDelete, resolveCheckpointZero, restoreCheckpointZero, restoreCheckpointZeroConfirmed } from '../domain/checkpoints.ts';
import { gs } from '@servicenow/glide';
import { CascadeDepthExceededError, DependentRunningError } from '../shared/errors.ts';
export function approve(id) {
    const t = WorkItem.load(id).approve();
    drain([t], effects);
}
// FOUNDATION GUARD — the ONE enforcement point for every accept path: every
// direct and transitive prerequisite must be completed. Runs only for a
// genuinely acceptable (in_review) item; any other state falls through to
// item.accept(), whose legality table answers the same 409 it always did.
function assertAcceptable(item) {
    if (item.state !== 'in_review')
        return;
    const blocker = foundationBlocker(item.sys_id, graphFor(item.plan_sys_id));
    if (blocker)
        throw new InvalidStateError(`cannot accept ${label(item)}: ${blocker}`, item.state);
}
export function accept(id, principal) {
    const item = WorkItem.load(id);
    assertAcceptable(item);
    if (principal && item.state !== 'in_review')
        throw new InvalidStateError('accept is legal only from in_review', item.state);
    // Keeping outcome empty prevents this audit narration from replacing the
    // delivered run result. When a principal is supplied this audit is required,
    // so persist it before completion and refuse a nullable insert result.
    if (principal) {
        const accepted = activity.insertActivity({
            kind: 'system',
            plan: item.plan_sys_id,
            work_item: item.sys_id,
            summary: `Accepted by ${principal}`
        });
        if (!accepted)
            throw new Error(`accept failed: could not record acceptance for ${id}`);
    }
    const t = item.accept();
    drain([t], effects);
}
function captureInFlightTurn(item, wasRunning) {
    if (!wasRunning)
        return null;
    const run = activity.getNewestRunActivity(item.sys_id);
    if (!run?.conversation)
        return null;
    return { conversation: run.conversation, principal: item.dispatchPrincipal() };
}
function cancelInFlightTurn(turn) {
    return turn ? foundry.cancelTurn(turn.conversation, turn.principal) : true;
}
// Best-effort eviction of whatever checkpoint is pending for this item's
// current run — wired into stop()/cancel() the same way cancelInFlightTurn is:
// called AFTER the state flip, never blocks or reverses the transition on
// failure. Unlike cancelInFlightTurn's callee (foundry.cancelTurn, which never
// throws), CheckpointManager crosses a real scope boundary and CAN throw (see
// rollback()'s own try/catch around CheckpointManager.restoreCheckpoint further
// down this file) — so this wraps it itself rather than assuming silence.
// Deliberately NOT gated on wasRunning: an item halted in a PRIOR run can still
// be carrying a pending checkpoint from that run, and evictPendingCheckpoint's
// own null-check already no-ops an item with no run at all. A returned
// {success:false} failure is already logged internally (gs.error) inside
// checkpointManager.js on every real failure path inside deletePendingCheckpoint,
// so this does not duplicate that. A genuine THROWN exception, however, produces
// no server-side evidence anywhere else, so this logs it here (gs.warn) — still
// nothing is surfaced to the caller and the error is never re-thrown.
function evictPendingWorkBestEffort(itemId) {
    try {
        evictPendingCheckpoint(itemId);
    }
    catch (e) {
        gs.warn(`[build-agent] checkpoint eviction failed for ${itemId}: ${e instanceof Error ? e.message : String(e)}`);
    }
}
// cancel()'s use of the shared restore, wrapped the same way
// evictPendingWorkBestEffort wraps eviction and for the same reason: the state
// flip is already committed by the time this runs, and a cancelled item that
// keeps its artifacts is a worse outcome than a cancel that reports success it
// cannot fully deliver — but it is not bad enough to justify reversing a
// terminal transition the engine has already published to the item's
// dependents. Logged (gs.warn) and never re-thrown, because a failure here
// produces no server-side evidence anywhere else.
//
// Deliberately uses the UNCONFIRMED restoreCheckpointZero, not the confirmed
// variant reopen/rollback use below — cancel's cleanup must stay non-blocking.
function restoreCheckpointZeroBestEffort(itemId) {
    try {
        restoreCheckpointZero(itemId);
    }
    catch (e) {
        gs.warn(`[build-agent] checkpoint 0 restore failed for ${itemId}: ${e instanceof Error ? e.message : String(e)}`);
    }
}
function evictPendingWorkForDelete(itemId) {
    const result = evictPendingCheckpointForDelete(itemId);
    if (result && !result.success)
        throw new Error(`checkpoint cleanup failed for ${itemId}: ${result.error ?? 'unknown error'}`);
}
// stop — the human andon cord on ONE item. The item halts to
// needs_attention(interrupted), and the agent's turn is cancelled.
//
// State changes before cancellation so a Foundry failure cannot leave the UI claiming
// that a still-running item was stopped.
export function stop(id) {
    const item = WorkItem.load(id);
    item.assertCanStop();
    // Captured before the flip: stop is only legal from in_progress, but reading it here
    // rather than assuming keeps this honest if that guard ever widens.
    const wasRunning = item.state === 'in_progress';
    const turn = captureInFlightTurn(item, wasRunning);
    settleNewestRunOrRecordSystem(item, 'interrupted', 'Stopped by a user.');
    transitionAndDrain(() => item.stop());
    cancelInFlightTurn(turn);
    evictPendingWorkBestEffort(item.sys_id);
}
export function cancel(id) {
    const item = WorkItem.load(id);
    item.assertCanCancel();
    // cancel is legal from EVERY non-terminal state, so unlike stop it usually has no
    // run to cancel. Only an in_progress item does.
    const wasRunning = item.state === 'in_progress';
    const turn = captureInFlightTurn(item, wasRunning);
    if (wasRunning)
        settleNewestRunOrRecordSystem(item, 'interrupted', 'Cancelled by a user.');
    const t = item.cancel();
    drain([t], effects);
    const retries = activity.supersedeRetryRequestsForWorkItem(item.sys_id);
    const automaticRestoreActive = retries.some(row => row.retry_status === 'restore_starting' || row.retry_status === 'restoring');
    cancelInFlightTurn(turn);
    evictPendingWorkBestEffort(item.sys_id);
    if (!automaticRestoreActive)
        restoreCheckpointZeroBestEffort(item.sys_id);
}
// Delete accepts every state. If the item is in progress, capture the live turn,
// settle it locally, move it out of in_progress, and cancel Foundry before removing
// the rows. Checkpoint cleanup is deletion-specific: it must not reopen a manual-edit
// continuation, and a hard cleanup failure aborts before the row cascade starts.
export function deleteItem(id) {
    const item = WorkItem.load(id);
    const plan = item.plan_sys_id;
    const dependents = dependentIdsOf(id);
    let failure;
    try {
        removeLoadedItem(item, false);
    }
    catch (e) {
        failure = e;
    }
    try {
        releaseDependents(plan, dependents);
    }
    catch (e) {
        if (failure === undefined)
            failure = e;
    }
    // Membership changed with no transition to hang an effect on: deleting the
    // last unsettled member can settle the plan (→ in_review), empty it entirely
    // (the rollup proposes nothing for zero members), or leave only cancelled
    // members and regress it to standby so authoring can continue. Runs AFTER
    // releaseDependents so it reads the survivors' post-release states, and even
    // after a partial failure — whatever rows did change deserve a consistent
    // plan — but never masks the original error.
    try {
        recomputePlanChainAndRelease(plan);
    }
    catch (e) {
        if (failure === undefined)
            failure = e;
    }
    if (failure !== undefined)
        throw failure;
}
// The delete itself, minus dependent release. AutoEng uses this split to remove every
// scoped item before evaluating survivors, so an internal dependent cannot dispatch
// mid-cascade. Dependent ids are collected before their edges disappear.
export function preflightItemDelete(id) {
    prepareLoadedItemForDelete(WorkItem.load(id));
}
export function removeItem(id, dependents = dependentIdsOf(id), preflighted = false) {
    const item = WorkItem.load(id);
    removeLoadedItem(item, preflighted);
    return { plan: item.plan_sys_id, dependents };
}
function prepareLoadedItemForDelete(item) {
    activity.supersedeRetryRequestsForWorkItem(item.sys_id);
    const wasRunning = item.state === 'in_progress';
    const turn = captureInFlightTurn(item, wasRunning);
    if (wasRunning) {
        if (!cancelInFlightTurn(turn))
            throw new Error(`turn cancellation failed for ${item.sys_id}`);
        settleNewestRunOrRecordSystem(item, 'interrupted', 'Deleted by a user.');
        transitionAndDrain(() => item.interrupted());
    }
    evictPendingWorkForDelete(item.sys_id);
}
function removeLoadedItem(item, preflighted) {
    if (!preflighted)
        prepareLoadedItemForDelete(item);
    item.delete();
}
// Re-evaluate the items that were waiting on something just deleted.
//
// Deleting a prerequisite is the OPPOSITE case from cancelling one. A cancelled
// prerequisite can never be met, so `evaluateDependents` halts the dependent; a deleted
// prerequisite takes its edge with it, so the dependent may now have nothing left to
// wait for and belongs at `ready`. Without this, nothing ever looks at that item again:
// readiness only runs as a transition effect, `sweepReadyItems` only touches items
// already at `ready`, and the stall watchdog only scans `in_progress` — so it would sit
// in `waiting` forever.
//
// `graphFor` is read HERE, after the delete, so the graph no longer contains the
// removed item or its edges — that is what turns the answer from `impossible`
// ("a prerequisite no longer exists") into `met`. `planId` only has to be a plan that
// still exists in the same subtree as the survivors; when the whole subtree is gone the
// graph comes back empty and this is a no-op, which is the right answer.
export function releaseDependents(planId, dependentIds) {
    if (!dependentIds.length)
        return;
    const queue = [];
    reevaluateWaitingDependents(dependentIds, graphFor(planId), t => queue.push(t));
    drain(queue, effects);
}
// reopen — the one verb that RETURNS something, because the client cannot open the
// rework chat without its id. It is also the one verb that creates before it
// transitions, so its order is:
//
//     load -> check legality -> RESTORE Checkpoint 0 -> CREATE the rework chat -> transition -> drain
//
// Legality first, so a replay against an already-draft item is refused BEFORE an
// orphan conversation row is inserted. Creation before the transition, so a
// failed create leaves the item exactly as it was — still reopenable — and raises a
// true error. (This replaces domain/seeder.ts, which ran after the transition, ate
// every error in a bare catch, and returned nothing: a reopened item could be left
// with no chat, and the client had no way to learn it.)
//
// ACCEPTED COST of that ordering, and it is wider than the replay case the paragraph
// above covers: everything after the create can still fail — the anchor or context
// insert, the transition, the drain — and each of those leaves some inert local rows
// behind. A Builder who retries inserts another conversation. This is deliberate:
// the reverse order can strand a reworked item with no usable chat at all. Deferred,
// not overlooked.
function reworkStatus(state) {
    switch (state) {
        case 'waiting':
            return 'Waiting';
        case 'ready':
            return 'Ready to execute';
        case 'in_review':
            return 'Pending review';
        case 'needs_attention':
            return 'Stopped';
        default:
            return state;
    }
}
function formatReworkIntroduction(item, priorRun) {
    const itemTitle = item.short_description ? `${label(item)} · ${item.short_description}` : label(item);
    const lines = ['**Rework context**', '', `You’re reworking **${itemTitle}**.`, '', `**Previous status:** ${reworkStatus(item.state)}`];
    const priorSummary = priorRun?.summary ? activity.activitySummary(priorRun.summary) : '';
    if (priorSummary.trim())
        lines.push('', priorSummary);
    lines.push('', 'Tell me what should change, or ask me to retry without changes. The work item remains in Draft until then.');
    return lines.join('\n');
}
export function reopen(id, principal) {
    const item = WorkItem.load(id);
    // Pre-check on the SAME predicate (and message) the entity guards on — the entity
    // still re-checks, since it owns its own invariant. Asking here is what orders the
    // refusal before the create.
    if (!canReopen(item.state))
        throw new InvalidStateError(REOPEN_ILLEGAL_STATE, item.state);
    // Refuse while a dependent is actively running against this item's current
    // output, rather than backing that output out from underneath it. A dependent
    // dispatched while this item was still reopenable (waiting/ready/in_review/
    // needs_attention, never `completed`) is not the impossible case it looks like —
    // confirmed live: a dependent can be `in_progress` here, and the restore below
    // would delete artifacts it is reading or about to extend, so it re-authors them
    // from scratch under a new sys_id. Reworking THIS item then recreates them too —
    // two copies of the same artifact (the DEF0888074 failure mode, recurring along
    // the dependency edge rather than within one item's own rework).
    //
    // TRANSITIVE, not just direct: a two-hop dependent (C depends_on B depends_on
    // this item) can be running while B itself sits at `completed` — B unblocking C
    // says nothing about whether B's own output still needs this item's artifact
    // to exist, and C's agent reads live installed metadata regardless of edge
    // depth. Reuses rollback()'s own "itself + every transitive dependent" walk
    // (computeRollbackOrder) rather than a shallower one-hop check — unbounded,
    // since this only READS state and never executes anything, so there is no
    // blast-radius-confirmation reason to cap it the way rollback() does.
    const graph = graphFor(item.plan_sys_id);
    const blastRadius = computeRollbackOrder(item.sys_id, graph, Number.MAX_SAFE_INTEGER);
    const liveDependents = [...blastRadius.depthById.keys()].filter(depId => depId !== item.sys_id && graph.states.get(depId) === 'in_progress');
    if (liveDependents.length > 0) {
        // User-facing (the client shows a 409's raw message verbatim), so this
        // names dependents by NUMBER, never by sys_id — same rule as label()
        // everywhere else a record becomes text a person reads.
        const liveDependentLabels = liveDependents.map(depId => label({ sys_id: depId, number: graph.numbers?.get(depId) }));
        // This refusal produces no other server-side evidence — it never reaches
        // restoreCheckpoint or any of its logging — so leave a trace here. Same
        // reasoning as evictPendingWorkBestEffort's gs.warn above: a thrown error
        // with nothing else logging it is exactly the visibility gap that made
        // the original duplication incident hard to trace after the fact.
        gs.warn(`[build-agent] reopen refused for ${label(item)}: dependent work item(s) running: ${liveDependentLabels.join(', ')}`);
        throw new DependentRunningError(`cannot reopen while a dependent work item is running: ${liveDependentLabels.join(', ')}`, liveDependents);
    }
    const retries = activity.supersedeRetryRequestsForWorkItem(item.sys_id);
    const activeRestore = retries.find(row => row.retry_status === 'restoring' && row.retry_restore_progress);
    const priorRun = activity.getNewestRunActivity(item.sys_id);
    // Undo the prior run's changes before the rework starts. A rework does NOT amend
    // the run it reworks — the re-approved item is dispatched into a brand-new
    // conversation with its own checkpoint chain and update set, so what the agent
    // authors the second time lands ALONGSIDE the first copy instead of over it. That
    // is DEF0888074: one rework of a "hello world" UI page left two UI pages on the
    // instance, the original still reading "hello world".
    //
    // Fail-loud, unlike cancel's best-effort call, and ordered before the create for
    // the same reason legality is. Reopen's whole product is "start this item over",
    // and starting over onto the last attempt's artifacts IS the defect rather than a
    // degraded fix — so a restore failure refuses the reopen and leaves the item where
    // it was, still reopenable, minting nothing. ACCEPTED COST: a Rework that used to
    // "succeed" into duplicates now answers 500 (checkpoint_restore_failed) on an item
    // whose update-set chain the platform cannot back out. The reverse case should be
    // recoverable: a restore that initiates and is then followed by a failed create
    // leaves the item in_review with its changes gone, and the retry should resolve to
    // "nothing left to restore", which restoreCheckpointZero treats as the no-op
    // success it is. That retry path is read off checkpointManager.js rather than
    // observed — worth confirming on an instance before it is relied on.
    //
    // Single item, no cascade: reopen restores only the selected item's prior run.
    // Cascading checkpoint restoration remains rollback()'s responsibility.
    if (activeRestore)
        confirmRestoreProgress(activeRestore.retry_restore_progress, item.sys_id);
    else
        restoreCheckpointZeroConfirmed(item.sys_id);
    // The title is the ONLY thing identifying this chat in the Builder's Studio list, so
    // it carries the number ("Rework · WI0001012") rather than a 32-character sys_id.
    const conversation = insertConversation({
        title: `Rework · ${label(item)}`,
        client: 'sns',
        user: principal,
        agentId: 'autoeng_reworker'
    });
    if (!conversation)
        throw new Error(`reopen failed: could not create a rework conversation for ${id}`);
    // The anchoring travels on the activity row, not on anything the Builder types:
    // `work_item` is what the rework chat is about, and `prior_activity` points at the run
    // being reworked — the prior-run reconcile pointer a re-executing agent follows
    // instead of resuming.
    //
    // A rejected insert (insertActivity answers null rather than throwing — an ACL
    // refusal, a BR abort) is fatal, not cosmetic: the chat would open with no work_item
    // and no prior_activity, so the rework agent could not tell which item it is amending.
    // That is the whole leg. Refuse loudly and leave the item reopenable.
    const reworkActivity = activity.insertActivity({
        conversation,
        kind: 'chat',
        plan: item.plan_sys_id,
        work_item: item.sys_id,
        prior_activity: priorRun?.id
    });
    if (!reworkActivity)
        throw new Error(`reopen failed: could not anchor the rework conversation to ${id}`);
    // Persist a normal assistant turn so the rework context is visible immediately
    // and becomes model history with the Builder's next user message.
    const intro = insertAssistantMessage({
        conversation,
        id: `rework-${reworkActivity.id}`,
        text: formatReworkIntroduction(item, priorRun)
    });
    if (!intro)
        throw new Error(`reopen failed: could not write rework context for ${id}`);
    drain([item.reopen()], effects);
    return { conversation, activity: reworkActivity };
}
// rollback: undoes a completed work item's agent-authored changes by walking
// its blast radius (itself + every transitive dependent, depth-capped) and
// restoring each affected item's Checkpoint 0 in reverse-dependency order —
// dependents before their prerequisites, computed by workflow/rollbackCascade.ts.
// Partial rollback: one item's restore failure does not stop the rest of the
// cascade.
//
// CONFIRMED, not just initiated: restoreCheckpointZeroConfirmed in
// domain/checkpoints.ts waits for each item's restore to actually finish — not
// just kicked off — before returning, so the reverse-dependency order here is
// enforced against real completion: the next item's restore only starts once
// the previous one is confirmed done or has thrown. See the comment on
// RollbackResultDto in shared/dto.ts for exactly what that confirmation covers, and
// restoreCheckpointZeroConfirmed's own comment for the known slow-vs-failed
// tradeoff it carries.
//
// Only the ROOT is guarded by assertCanRollback (completed-only — the
// confirmed use case). A cascade dependent may legitimately be
// waiting/ready/in_review/needs_attention/completed when it's swept into the
// blast radius — those -> draft pairs are already legal (reopen's four states
// plus rollback's own completed entry), so cascade items transition via the
// bare transitionTo door rather than the narrower root-only guard. An
// in_progress dependent (a live run right now) is left alone and reported as
// a failure rather than forced through a transition that exists nowhere in
// this engine — and so is every one of ITS prerequisites within the blast
// radius, transitively: rolling one of those back out from underneath a live
// dependent is the same DEF0888074 duplication risk reopen() refuses outright,
// just reachable via a cascade instead of a single item. See the blockedIds
// walk in the restore loop below.
const DEFAULT_MAX_CASCADE_DEPTH = 5;
function assertRollbackPlansNonTerminal(item) {
    const { owningPlanState, rootState } = item.rootPlanFields();
    if (owningPlanState === 'completed' || owningPlanState === 'cancelled') {
        throw new InvalidStateError(`cannot roll back ${label(item)}: directly owning ${owningPlanState} plan is terminal`, item.state);
    }
    if (rootState === 'completed' || rootState === 'cancelled') {
        throw new InvalidStateError(`cannot roll back ${label(item)}: root ${rootState} plan is terminal`, item.state);
    }
}
// Shared by preview and execute: takes the already-loaded root, builds its
// plan's graph, and computes the blast radius + restore order. Does NOT
// decide what to do about depthExceeded — that decision differs between the
// two callers (preview only ever REPORTS it; execute always REJECTS it,
// whatever depth — default or an explicit maxDepth — was actually attempted,
// since an explicit maxDepth that still isn't wide enough is a confirmation
// of depth, not a license to truncate), so it stays out of this shared
// helper. Takes the root ENTITY, not an id, so callers that already loaded it
// (rollback() does, to call assertCanRollback) don't pay a second read of the
// same row.
function computeCascadeForRoot(root, maxDepth) {
    const graph = graphFor(root.plan_sys_id);
    const cappedMaxDepth = maxDepth ?? DEFAULT_MAX_CASCADE_DEPTH;
    const result = computeRollbackOrder(root.sys_id, graph, cappedMaxDepth);
    if (result.incomplete.length > 0) {
        // Defensive: readiness.ts's cycle detection rejects a cycle before an item
        // can leave draft, so this should not happen. Surface it loudly rather
        // than silently resolving to a partial, successful-looking cascade — for
        // BOTH preview and execute, unlike depthExceeded below.
        throw new Error(`rollback could not determine a restore order for: ${result.incomplete.join(', ')} (possible cycle)`);
    }
    // graph rides along so rollback() can tell, for each item as it comes up in
    // the restore loop, whether any of ITS OWN dependents are still live — see
    // the blockedIds walk there. previewRollback ignores it.
    return { ...result, graph };
}
export function previewRollback(id, maxDepth) {
    const root = WorkItem.load(id);
    // depthExceeded is deliberately just read off the result, never thrown —
    // preview is read-only and exists precisely so a caller can see a too-wide
    // blast radius before deciding whether to confirm it via maxDepth on the
    // execute call. Only rollback() below rejects on it.
    const { order, depthById, depthExceeded } = computeCascadeForRoot(root, maxDepth);
    const items = order.map(itemId => {
        const item = WorkItem.load(itemId);
        const cp0 = resolveCheckpointZero(itemId);
        return {
            workItemId: itemId,
            name: label(item),
            conversationId: cp0?.conversationId ?? null,
            cp0SysId: cp0?.cp0SysId ?? null,
            depth: depthById.get(itemId) ?? 0,
            restorable: cp0 !== null
        };
    });
    return { items, depthExceeded };
}
export function rollback(id, reason, maxDepth) {
    const root = WorkItem.load(id);
    root.assertCanRollback();
    const { order, depthExceeded, graph } = computeCascadeForRoot(root, maxDepth);
    if (depthExceeded) {
        // Reject regardless of whether maxDepth was explicitly passed: an
        // explicit maxDepth that is STILL too narrow for the blast radius is
        // not a license to silently truncate the cascade — depthExceeded
        // being true means dependents beyond the attempted depth would be
        // left completed on top of an already-reverted prerequisite.
        const attempted = maxDepth ?? DEFAULT_MAX_CASCADE_DEPTH;
        throw new CascadeDepthExceededError(`blast radius exceeds the requested cascade depth of ${attempted}; pass a larger maxDepth to confirm a wider rollback`, attempted);
    }
    // Validate the entire cascade before the first checkpoint restore. Discovering
    // a terminal enclosing plan inside the restore loop would leave earlier items
    // already mutated even though the rollback as a whole must be refused.
    for (const currentId of order) {
        const currentItem = WorkItem.tryLoad(currentId);
        if (currentItem)
            assertRollbackPlansNonTerminal(currentItem);
    }
    const effectiveReason = reason || 'Rolled back by user';
    const rolledBack = [];
    const failed = [];
    // Reverse of graph.prerequisites, restricted implicitly to what `order` ever
    // looks up: item id -> every item that depends_on it (its dependents), so an
    // item about to be rolled back can be checked against its OWN dependents'
    // fate. `order` is dependents-before-prerequisites, so by the time a given id
    // is reached here every one of its dependents has already been fully decided.
    const dependentsOf = new Map();
    for (const [itemId, prereqs] of graph.prerequisites) {
        for (const prereq of prereqs) {
            const list = dependentsOf.get(prereq) ?? [];
            list.push(itemId);
            dependentsOf.set(prereq, list);
        }
    }
    // An item goes in here when it is EITHER itself in_progress OR a prerequisite
    // (direct or transitive) of one that is — the same live-run duplication risk
    // reopen() refuses outright: backing out a prerequisite's output while a
    // dependent is actively reading/extending it makes that dependent re-author
    // the missing artifact under a new sys_id. Partial-rollback resilience is
    // preserved for branches that never touch a live item — only the chain
    // beneath an in_progress dependent is skipped, not the whole cascade.
    const blockedIds = new Set();
    for (const currentId of order) {
        const currentItem = WorkItem.tryLoad(currentId);
        if (!currentItem) {
            failed.push({ workItemId: currentId, name: currentId, error: 'work item no longer exists' });
            continue;
        }
        const name = label(currentItem);
        if (currentItem.state === 'in_progress') {
            // Same reasoning as reopen()'s gs.warn above: this skip produces no
            // other server-side evidence, and a partial-rollback cascade can
            // silently leave items untouched across several unrelated failed[]
            // entries — leave a trace naming exactly which item and why.
            gs.warn(`[build-agent] rollback skipped ${name} (${currentId}): item is currently running`);
            failed.push({ workItemId: currentId, name, error: 'item is currently running, cannot roll back' });
            blockedIds.add(currentId);
            continue;
        }
        const liveDependentId = (dependentsOf.get(currentId) ?? []).find(depId => blockedIds.has(depId));
        if (liveDependentId !== undefined) {
            // By NUMBER, not sys_id — this error string reaches the user verbatim.
            const liveDependentLabel = label({ sys_id: liveDependentId, number: graph.numbers?.get(liveDependentId) });
            gs.warn(`[build-agent] rollback skipped ${name} (${currentId}): dependent work item ${liveDependentLabel} is running (or depends on one that is)`);
            failed.push({
                workItemId: currentId,
                name,
                error: `cannot roll back: dependent work item ${liveDependentLabel} is running (or depends on one that is)`
            });
            blockedIds.add(currentId);
            continue;
        }
        // Populated only when a real restoreCheckpoint call actually initiated a
        // backout — absent for a no-op (the item never ran, or CP0 is its only
        // checkpoint). restoreCheckpointZeroConfirmed draws that line and reports
        // a genuine failure by throwing, which is what lands the item in failed[]
        // while leaving the rest of the cascade to continue.
        let restored;
        try {
            restored = restoreCheckpointZeroConfirmed(currentId);
        }
        catch (e) {
            failed.push({ workItemId: currentId, name, error: e instanceof Error ? e.message : String(e) });
            continue;
        }
        const { backoutProgressId, postProcessingProgressId } = restored;
        const itemReason = currentId === id ? effectiveReason : `${effectiveReason} — dependency cascade from ${label(root)}`;
        // transition, drain, and the audit-recording settle all happen inside
        // ONE try block: settleNewestRunOrRecordSystem can genuinely throw (an
        // ACL refusal on the activity insert), and if it does AFTER
        // transitionTo already succeeded, the item's state WAS genuinely
        // changed to draft even though this reports it in failed[] — an
        // intentional, honest tradeoff. The loop can't roll back the state
        // write, so surfacing the audit-recording failure explicitly is more
        // honest than silently reporting a clean success with a missing audit
        // trail. Either way, the exception must never escape this loop and
        // abort the rest of the cascade (partial-rollback resilience).
        try {
            const transition = currentItem.transitionTo('draft');
            drain([transition], effects);
            settleNewestRunOrRecordSystem(currentItem, 'rolled_back', itemReason);
        }
        catch (e) {
            failed.push({ workItemId: currentId, name, error: e instanceof Error ? e.message : String(e) });
            continue;
        }
        rolledBack.push({
            workItemId: currentId,
            name,
            reason: itemReason,
            ...(backoutProgressId !== undefined ? { backoutProgressId } : {}),
            ...(postProcessingProgressId !== undefined ? { postProcessingProgressId } : {})
        });
    }
    return { rolledBack, failed, depthExceeded };
}
