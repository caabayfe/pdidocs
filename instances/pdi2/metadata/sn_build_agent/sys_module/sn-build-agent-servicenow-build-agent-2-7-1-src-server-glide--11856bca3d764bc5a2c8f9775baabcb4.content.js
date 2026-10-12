import { gs } from '@servicenow/glide';
import { newRecord } from './records.ts';
const SUMMARY_MAX = 4000;
export function activitySummary(summary) {
    if (summary.length <= SUMMARY_MAX)
        return summary;
    return `${summary.slice(0, SUMMARY_MAX - 1)}…`;
}
function persistedRetryCount(raw) {
    const value = String(raw ?? '');
    if (!/^[0-3]$/.test(value))
        return null;
    const count = Number(value);
    return Number.isFinite(count) && Number.isInteger(count) && count >= 0 && count <= 3 ? count : null;
}
function rowFrom(gr) {
    return {
        id: String(gr.getUniqueValue()),
        conversation: String(gr.getValue('conversation') ?? ''),
        kind: String(gr.getValue('kind') ?? 'chat'),
        outcome: String(gr.getValue('outcome') ?? ''),
        summary: String(gr.getValue('summary') ?? ''),
        plan: String(gr.getValue('plan') ?? ''),
        work_item: String(gr.getValue('work_item') ?? ''),
        prior_activity: String(gr.getValue('prior_activity') ?? ''),
        retry_status: String(gr.getValue('retry_status') ?? ''),
        retry_trigger: String(gr.getValue('retry_trigger') ?? ''),
        retry_count: persistedRetryCount(gr.getValue('retry_count')),
        retry_restore_progress: String(gr.getValue('retry_restore_progress') ?? ''),
        retry_restore_deadline: String(gr.getValue('retry_restore_deadline') ?? ''),
        retry_claim_token: String(gr.getValue('retry_claim_token') ?? ''),
        retry_claim_until: String(gr.getValue('retry_claim_until') ?? ''),
        created: String(gr.getValue('sys_created_on') ?? '')
    };
}
function setRetryMarker(gr, retry) {
    gr.setValue('retry_status', retry.status);
    gr.setValue('retry_trigger', retry.trigger);
    gr.setValue('retry_count', retry.count);
}
export function insertActivity(row) {
    const gr = newRecord('sn_build_agent_activity');
    gr.initialize();
    if (row.conversation)
        gr.setValue('conversation', row.conversation);
    gr.setValue('kind', row.kind);
    gr.setValue('plan', row.plan);
    if (row.work_item)
        gr.setValue('work_item', row.work_item);
    if (row.prior_activity)
        gr.setValue('prior_activity', row.prior_activity);
    if (row.outcome)
        gr.setValue('outcome', row.outcome);
    if (row.summary)
        gr.setValue('summary', activitySummary(row.summary));
    if (row.retry)
        setRetryMarker(gr, row.retry);
    const id = gr.insert();
    return id ? rowFrom(gr) : null;
}
export function settleActivity(id, outcome, summary, retry) {
    const gr = newRecord('sn_build_agent_activity');
    if (!gr.get('sys_id', id))
        return null;
    gr.setValue('outcome', outcome);
    gr.setValue('summary', activitySummary(summary));
    if (retry)
        setRetryMarker(gr, retry);
    return gr.update() ? rowFrom(gr) : null;
}
export function getActivityByConversation(conversationId) {
    const gr = newRecord('sn_build_agent_activity');
    gr.addQuery('conversation', conversationId);
    gr.query();
    return gr.next() ? rowFrom(gr) : null;
}
export function getActivityById(id) {
    if (!id)
        return null;
    const gr = newRecord('sn_build_agent_activity');
    return gr.get('sys_id', id) ? rowFrom(gr) : null;
}
export function listRetryActivities(status, limit) {
    const out = [];
    const gr = newRecord('sn_build_agent_activity');
    gr.addQuery('retry_status', status);
    gr.orderBy('sys_created_on');
    gr.orderBy('sys_id');
    gr.setLimit(limit);
    gr.query();
    while (gr.next())
        out.push(rowFrom(gr));
    return out;
}
export function listExpiredRetryActivities(status, now, limit) {
    const rows = new Map();
    for (const [operator, value] of [
        ['=', ''],
        ['<=', now]
    ]) {
        const gr = newRecord('sn_build_agent_activity');
        gr.addQuery('retry_status', status);
        gr.addQuery('retry_claim_until', operator, value);
        gr.orderBy('sys_created_on');
        gr.orderBy('sys_id');
        gr.query();
        while (gr.next()) {
            const row = rowFrom(gr);
            rows.set(row.id, row);
        }
    }
    return [...rows.values()].sort((a, b) => a.created.localeCompare(b.created) || a.id.localeCompare(b.id)).slice(0, limit);
}
const TERMINAL_RETRY_STATUSES = ['completed', 'failed', 'superseded', 'exhausted'];
export function listTerminalRetryClaims(limit) {
    if (limit <= 0)
        return [];
    const rows = new Map();
    for (const status of TERMINAL_RETRY_STATUSES) {
        for (const field of ['retry_claim_token', 'retry_claim_until']) {
            const gr = newRecord('sn_build_agent_activity');
            gr.addQuery('retry_status', status);
            gr.addQuery(field, '!=', '');
            gr.orderBy('sys_created_on');
            gr.orderBy('sys_id');
            gr.setLimit(limit);
            gr.query();
            while (gr.next()) {
                const row = rowFrom(gr);
                rows.set(row.id, row);
            }
        }
    }
    return [...rows.values()].sort((a, b) => a.created.localeCompare(b.created) || a.id.localeCompare(b.id)).slice(0, limit);
}
export function clearTerminalRetryClaim(input) {
    const gr = newRecord('sn_build_agent_activity');
    gr.addQuery('sys_id', input.id);
    gr.addQuery('retry_status', input.status);
    gr.addQuery('retry_claim_token', input.token);
    gr.setValue('retry_claim_token', '');
    gr.setValue('retry_claim_until', '');
    gr.updateMultiple();
    const cleared = getActivityById(input.id);
    if (cleared?.retry_status !== input.status || cleared.retry_claim_token || cleared.retry_claim_until)
        return null;
    return cleared;
}
export function listActivitySuccessors(workItemId, activityId) {
    const out = [];
    const gr = newRecord('sn_build_agent_activity');
    gr.addQuery('work_item', workItemId);
    gr.addQuery('prior_activity', activityId);
    gr.orderBy('sys_created_on');
    gr.orderBy('sys_id');
    gr.query();
    while (gr.next())
        out.push(rowFrom(gr));
    return out;
}
function tryClaim(input, leaseOperator, leaseValue) {
    const gr = newRecord('sn_build_agent_activity');
    gr.addQuery('sys_id', input.id);
    gr.addQuery('retry_status', input.from);
    gr.addQuery('retry_claim_until', leaseOperator, leaseValue);
    gr.setValue('retry_status', input.to);
    gr.setValue('retry_claim_token', input.token);
    gr.setValue('retry_claim_until', input.claimUntil);
    gr.updateMultiple();
    const claimed = getActivityById(input.id);
    return claimed?.retry_status === input.to && claimed.retry_claim_token === input.token ? claimed : null;
}
export function claimRetryActivity(input) {
    return tryClaim(input, '=', '') ?? tryClaim(input, '<=', input.now);
}
function retryTransition(input, token) {
    const gr = newRecord('sn_build_agent_activity');
    gr.addQuery('sys_id', input.id);
    gr.addQuery('retry_status', input.from);
    if (token !== undefined)
        gr.addQuery('retry_claim_token', token);
    gr.setValue('retry_status', input.to);
    if (input.restoreProgress !== undefined)
        gr.setValue('retry_restore_progress', input.restoreProgress);
    if (input.restoreDeadline !== undefined)
        gr.setValue('retry_restore_deadline', input.restoreDeadline);
    if (input.clearClaim) {
        gr.setValue('retry_claim_token', '');
        gr.setValue('retry_claim_until', '');
    }
    gr.updateMultiple();
    const updated = getActivityById(input.id);
    if (updated?.retry_status !== input.to)
        return null;
    if (input.restoreProgress !== undefined && updated.retry_restore_progress !== input.restoreProgress)
        return null;
    if (input.restoreDeadline !== undefined && updated.retry_restore_deadline !== input.restoreDeadline)
        return null;
    if (input.clearClaim && (updated.retry_claim_token || updated.retry_claim_until))
        return null;
    if (token !== undefined && !input.clearClaim && updated.retry_claim_token !== token)
        return null;
    return updated;
}
export function transitionRetryActivity(input) {
    return retryTransition(input);
}
export function updateClaimedRetry(input) {
    return retryTransition(input, input.token);
}
const ACTIONABLE_RETRY_STATUSES = ['pending', 'restore_starting', 'restoring', 'dispatching'];
function supersedeOwnedRetry(candidate, token) {
    const claim = newRecord('sn_build_agent_activity');
    claim.addQuery('sys_id', candidate.id);
    claim.addQuery('retry_status', candidate.retry_status);
    claim.setValue('retry_status', 'superseded');
    claim.setValue('retry_claim_token', token);
    claim.updateMultiple();
    const owned = getActivityById(candidate.id);
    if (owned?.retry_status !== 'superseded' || owned.retry_claim_token !== token)
        return false;
    const clear = newRecord('sn_build_agent_activity');
    clear.addQuery('sys_id', candidate.id);
    clear.addQuery('retry_status', 'superseded');
    clear.addQuery('retry_claim_token', token);
    clear.setValue('retry_claim_token', '');
    clear.setValue('retry_claim_until', '');
    clear.updateMultiple();
    const cleared = getActivityById(candidate.id);
    return cleared?.retry_status === 'superseded' && !cleared.retry_claim_token && !cleared.retry_claim_until;
}
export function supersedeRetryRequestsForWorkItem(workItemId) {
    const candidates = [];
    const gr = newRecord('sn_build_agent_activity');
    gr.addQuery('work_item', workItemId);
    gr.addQuery('retry_status', 'IN', ACTIONABLE_RETRY_STATUSES.join(','));
    gr.orderByDesc('sys_created_on');
    gr.orderByDesc('sys_id');
    gr.query();
    while (gr.next())
        candidates.push(rowFrom(gr));
    const superseded = [];
    for (const candidate of candidates) {
        if (supersedeOwnedRetry(candidate, gs.generateGUID()))
            superseded.push(candidate);
    }
    return superseded;
}
export function hasActivitySuccessor(workItemId, activityId) {
    const gr = newRecord('sn_build_agent_activity');
    gr.addQuery('work_item', workItemId);
    gr.addQuery('prior_activity', activityId);
    gr.setLimit(1);
    gr.query();
    return gr.next();
}
export function automaticRetryDepth(failedActivity) {
    let depth = 0;
    let current = failedActivity;
    const visited = new Set([current.id]);
    while (current.prior_activity) {
        if (depth >= 3 || visited.has(current.prior_activity))
            return null;
        const parent = getActivityById(current.prior_activity);
        if (!parent || parent.work_item !== failedActivity.work_item)
            return null;
        visited.add(parent.id);
        current = parent;
        depth += 1;
    }
    return depth;
}
// Selection is deterministic: a unique open leaf wins when requested, then a
// unique lineage leaf wins. Otherwise the first query-ordered row is the
// corruption/manual-multi-root fallback.
function lineageLeaf(rows, preferOpen = false) {
    if (!rows.length)
        return null;
    const referenced = new Set(rows.map(row => row.prior_activity).filter(Boolean));
    const leaves = rows.filter(row => !referenced.has(row.id));
    if (preferOpen) {
        const openLeaves = leaves.filter(row => !row.outcome);
        if (openLeaves.length === 1)
            return openLeaves[0];
    }
    return leaves.length === 1 ? leaves[0] : rows[0];
}
export function getNewestRunActivity(workItemId) {
    const rows = [];
    const gr = newRecord('sn_build_agent_activity');
    gr.addQuery('work_item', workItemId);
    gr.addQuery('kind', 'run');
    gr.orderByDesc('sys_created_on');
    gr.setLimit(4);
    gr.query();
    while (gr.next())
        rows.push(rowFrom(gr));
    return lineageLeaf(rows, true);
}
export function getNewestSettledActivity(workItemId) {
    return getNewestSettledActivities([workItemId]).get(workItemId) ?? null;
}
// One ordered query for list projections. Grouping retains at most the four
// possible original-plus-retry rows per item, with no activity query per card.
export function getNewestSettledActivities(workItemIds) {
    const out = new Map();
    if (!workItemIds.length)
        return out;
    const grouped = new Map();
    const gr = newRecord('sn_build_agent_activity');
    gr.addQuery('work_item', 'IN', workItemIds.join(','));
    gr.addQuery('outcome', '!=', '');
    gr.orderByDesc('sys_updated_on');
    gr.query();
    while (gr.next()) {
        const row = rowFrom(gr);
        const rows = grouped.get(row.work_item);
        if (!rows)
            grouped.set(row.work_item, [row]);
        else if (rows.length < 4)
            rows.push(row);
    }
    for (const [workItemId, rows] of grouped) {
        const leaf = lineageLeaf(rows);
        if (leaf)
            out.set(workItemId, leaf);
    }
    return out;
}
export function listActivityForWorkItem(id) {
    const out = [];
    const gr = newRecord('sn_build_agent_activity');
    gr.addQuery('work_item', id);
    gr.orderByDesc('sys_created_on');
    gr.query();
    while (gr.next())
        out.push(rowFrom(gr));
    return out;
}
// Same ordering as listActivityForWorkItem, but filtered to kind='run' at the
// query layer rather than in application code — a work item with a long chat
// history (the norm for AutoEng run conversations) would otherwise fetch and
// discard every chat/system row just to find its runs.
export function listRunActivitiesForWorkItem(id) {
    const out = [];
    const gr = newRecord('sn_build_agent_activity');
    gr.addQuery('work_item', id);
    gr.addQuery('kind', 'run');
    gr.orderByDesc('sys_created_on');
    gr.query();
    while (gr.next())
        out.push(rowFrom(gr));
    return out;
}
export function listActivityForPlan(id) {
    const out = [];
    const gr = newRecord('sn_build_agent_activity');
    gr.addQuery('plan', id);
    gr.addQuery('work_item', '');
    gr.orderByDesc('sys_created_on');
    gr.query();
    while (gr.next())
        out.push(rowFrom(gr));
    return out;
}
// Collect-then-delete over one field match. Ids come off a read cursor first and
// each row is deleted through its own fresh cursor, so nothing is removed from
// under a live result set. Local to this module for the same reason every other
// query here is: activity rows are this file's table.
function deleteActivityWhere(field, value) {
    const ids = [];
    const gr = newRecord('sn_build_agent_activity');
    gr.addQuery(field, value);
    gr.query();
    while (gr.next())
        ids.push(String(gr.getUniqueValue()));
    let deleted = 0;
    for (const id of ids) {
        const row = newRecord('sn_build_agent_activity');
        if (!row.get(id))
            continue;
        if (!row.deleteRecord())
            throw new Error(`activity delete failed: ${id}`);
        deleted++;
    }
    return deleted;
}
// Every activity row for one work item — the whole append-only history, not just
// the settled ones, since the item it hangs off is going away.
export function deleteActivityForWorkItem(workItemId) {
    return deleteActivityWhere('work_item', workItemId);
}
// Every activity row for one plan, INCLUDING rows that still name a work item.
// Deliberately wider than listActivityForPlan's `work_item = ''` read filter:
// that read wants the plan's own timeline, but this is the cascade's floor —
// `plan` is a mandatory reference, so any row left behind here would point at a
// plan row that no longer exists. Work-item rows are normally already gone by
// the time this runs (deleteActivityForWorkItem, per item); this catches a row
// whose work item vanished some other way rather than leaving it orphaned.
export function deleteActivityForPlan(planId) {
    return deleteActivityWhere('plan', planId);
}
// Derive plan execution bounds from this plan's work-item activities.
// activated_on = earliest 'run' activity sys_created_on;
// completed_on = latest 'run' or 'system' activity sys_created_on.
// Returns empty strings when no matching activity exists.
export function getPlanActivityBounds(planId) {
    const grStart = newRecord('sn_build_agent_activity');
    grStart.addQuery('plan', planId);
    grStart.addQuery('work_item', '!=', '');
    grStart.addQuery('kind', 'run');
    grStart.orderBy('sys_created_on');
    grStart.setLimit(1);
    grStart.query();
    const activated_on = grStart.next() ? String(grStart.getValue('sys_created_on') ?? '') : '';
    const grEnd = newRecord('sn_build_agent_activity');
    grEnd.addQuery('plan', planId);
    grEnd.addQuery('work_item', '!=', '');
    grEnd.addQuery('kind', 'IN', 'run,system');
    grEnd.orderByDesc('sys_created_on');
    grEnd.setLimit(1);
    grEnd.query();
    const completed_on = grEnd.next() ? String(grEnd.getValue('sys_created_on') ?? '') : '';
    return { activated_on, completed_on };
}
