/// <reference path="../foundry/glideBridge.d.ts" />
import { newRecord } from './records.ts';
import { listRunActivitiesForWorkItem } from './activity.ts';
import { global } from '@servicenow/glide/global';
const CHECKPOINT_TABLE = 'sn_build_agent_checkpoint';
const UPDATE_SET_TABLE = 'sys_update_set';
const SYS_SCOPE_TABLE = 'sys_scope';
function s(gr, field) {
    return String(gr.getValue(field) ?? '');
}
// The batch-base update set for a conversation's checkpoint chain: the update
// set of that conversation's first INSTALL checkpoint. This mirrors
// CheckpointManager's own #getBatchBaseUpdateSet read (checkpointManager.js) —
// the lowest-sequence checkpoint greater than 0 that carries a non-empty
// update_set. Sequence 0 (CP0, the placeholder baseline) is excluded even
// when a legacy CP0 happens to carry its own (global-scope) update set, so
// that set is never mistaken for the batch base. Every update set within the
// chain is parented back to this one (sys_update_set.parent), so it is the
// single row that represents the whole chain's output.
//
// Implemented as a full scan of the conversation's checkpoints ordered by
// sequence, rather than a query-time `sequence > 0` filter, so this reads
// through nothing but the shared record seam's `=`/`!=`/`IN` query surface.
function findBatchBaseUpdateSet(conversationId) {
    const gr = newRecord(CHECKPOINT_TABLE);
    gr.addQuery('conversation', conversationId);
    gr.orderBy('sequence');
    gr.query();
    while (gr.next()) {
        const sequence = Number(gr.getValue('sequence') ?? 0);
        const updateSet = s(gr, 'update_set');
        if (sequence > 0 && updateSet)
            return updateSet;
    }
    return null;
}
// Create a brand-new sys_update_set row anchoring a plan or sub-plan, via the
// same global-scope UpdateSetService.createUpdateSet checkpointManager.js's own
// #createUpdateSet already routes through for checkpoint update sets — not a raw
// GlideRecord insert. sn_build_agent carries no cross-scope privilege on
// sys_update_set, so a same-scope insert against that table silently fails
// (insert() returns falsy, no error); UpdateSetService is the platform-sanctioned
// way around that. `applicationId` is left undefined, matching the platform's own
// "no application means Global" convention — a root plan's set is anchored global
// on purpose (checkpoint sets, by contrast, always populate `application` with the
// conversation's own app scope). Passing `parentUpdateSetId` re-parents a sub-plan's
// set under its root's, so the platform's native `sys_update_set.parent` walk
// discovers the whole plan -> sub-plan tree rooted at the same place the plan
// hierarchy itself is rooted.
export function createPlanUpdateSet(name, parentUpdateSetId) {
    const result = global.UpdateSetService.createUpdateSet(name, '', parentUpdateSetId);
    if (!result.success || !result.updateSetId)
        throw new Error('plan update set insert failed');
    return result.updateSetId;
}
// The plan release step's ONE platform write: mark the plan's batch update set
// complete via the same global-scope UpdateSetService route createPlanUpdateSet
// uses, and for the same cross-scope-privilege reason. Single-arg on purpose —
// NEVER pass an applicationId. Never throws: the caller (engine/plans.ts's
// releasePlan) answers the outcome synchronously and narrates a failure on the
// plan's activity timeline, and a thrown platform fault would bypass that
// bookkeeping — so a throw is caught and reported as the same
// { success:false, error } shape the script include itself answers. Plan release does
// not negotiate the completion protocol used by core-pack; a pending scan therefore
// remains a legacy failed release until the standalone idempotent release endpoint is retried.
export function markPlanUpdateSetComplete(updateSetId) {
    try {
        const result = global.UpdateSetService.markUpdateSetComplete(updateSetId);
        if (result.success)
            return { success: true };
        return { success: false, error: result.error || 'the platform could not mark the update set complete' };
    }
    catch (e) {
        return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
}
// A sys_scope row's display name, e.g. resolving an update set's
// `application` reference to something a human can read. '' when the
// reference is empty or unresolvable.
function resolveScopeName(applicationSysId) {
    if (!applicationSysId)
        return '';
    const gr = newRecord(SYS_SCOPE_TABLE);
    return gr.get(applicationSysId) ? s(gr, 'name') : '';
}
// A plan's own update set: a direct sys_id lookup off the plan's own
// `batch_update_set` field (populated eagerly at plan-creation time — see
// domain/plan.ts's Plan.create()/ensureUpdateSet()), not a traversal like
// resolveWorkItemUpdateSets below. Returns null for an empty id — the one
// caller, domain/plan.ts's Plan.updateSetDto(), backfills batch_update_set
// first on every DTO-building path (not just a single-item load), so an
// empty id reaching here means that backfill itself failed, a logged anomaly
// rather than the ordinary "legacy row" case — or for an id that simply
// doesn't resolve to a real row.
export function resolvePlanUpdateSet(batchUpdateSetId) {
    if (!batchUpdateSetId)
        return null;
    const gr = newRecord(UPDATE_SET_TABLE);
    if (!gr.get(batchUpdateSetId))
        return null;
    return {
        sys_id: gr.getUniqueValue(),
        name: s(gr, 'name'),
        state: s(gr, 'state'),
        parent: s(gr, 'parent'),
        scope: resolveScopeName(s(gr, 'application')),
        completed_by: s(gr, 'completed_by'),
        completed_on: s(gr, 'completed_on'),
        sys_created_by: s(gr, 'sys_created_by'),
        sys_created_on: s(gr, 'sys_created_on')
    };
}
// Reads one sys_update_set row into the internal UpdateSetRow projection —
// the row shape resolveWorkItemUpdateSets resolves down to once it has a
// batch-base sys_id in hand. Extracted so that projection is written once
// rather than once per resolver. Returns null for an empty id or one that
// doesn't resolve to a real row.
function readUpdateSetRow(updateSetId) {
    if (!updateSetId)
        return null;
    const gr = newRecord(UPDATE_SET_TABLE);
    if (!gr.get(updateSetId))
        return null;
    return {
        sys_id: gr.getUniqueValue(),
        name: s(gr, 'name'),
        state: s(gr, 'state'),
        parent: s(gr, 'parent'),
        scope: resolveScopeName(s(gr, 'application')),
        completed_by: s(gr, 'completed_by'),
        completed_on: s(gr, 'completed_on'),
        sys_created_by: s(gr, 'sys_created_by'),
        sys_created_on: s(gr, 'sys_created_on')
    };
}
// A work item's FULL run history's output update sets: one entry per run
// activity that has actually produced a batch-base update set, newest run
// first (listRunActivitiesForWorkItem already orders newest-first, and each
// run's chain is resolved independently in that order). A reworked work item
// can carry several run activities — reopening never deletes or backs out
// the abandoned run's checkpoint chain, it just starts a fresh conversation
// alongside it (see the association research this module is built on) — so
// every run's chain is walked on its own rather than assuming only the
// newest run matters. A run with no conversation yet, or whose chain hasn't
// produced a batch-base update set yet (no install has completed), is
// dropped rather than represented as a null placeholder: there is nothing to
// show for that run yet, not a gap in an otherwise-complete list.
export function resolveWorkItemUpdateSets(workItemId) {
    const runs = listRunActivitiesForWorkItem(workItemId);
    const rows = [];
    for (const run of runs) {
        if (!run.conversation)
            continue;
        const row = readUpdateSetRow(findBatchBaseUpdateSet(run.conversation));
        if (row)
            rows.push(row);
    }
    return rows;
}
// Every direct child of an update set (sys_update_set rows whose `parent`
// points at it) — a flat, one-level query, not the full recursive subtree
// CheckpointManager itself walks for restore/backout. Bare sys_ids, not
// wrapped objects: nothing ever attaches a second field to an entry, and this
// is exactly the shape of the `children: string[]` field UpdateSetDto
// (shared/dto.ts) documents, so toUpdateSetDto below assigns it straight
// through with no extra mapping. Callers link straight into the record's
// classic form view with these ids, the same as `parent` above.
export function listUpdateSetChildren(updateSetId) {
    const gr = newRecord(UPDATE_SET_TABLE);
    gr.addQuery('parent', updateSetId);
    gr.query();
    const out = [];
    while (gr.next())
        out.push(gr.getUniqueValue());
    return out;
}
// Projects one internal UpdateSetRow (the complete mirror of the table row,
// including the audit fields no wire consumer has asked for yet) down to the
// minimal wire-facing UpdateSetDto: drops completed_by/completed_on/
// sys_created_by/sys_created_on, turns an empty `parent` into null (the same
// empty-string-to-null convention ActivityDto's `conversation` uses), and
// fills `children` with a fresh query rather than a field already on the row
// — the row has no such field, since a set's children are never resolved as
// part of loading the set itself.
export function toUpdateSetDto(row) {
    return {
        sys_id: row.sys_id,
        name: row.name,
        state: row.state,
        parent: row.parent || null,
        scope: row.scope,
        children: listUpdateSetChildren(row.sys_id)
    };
}
