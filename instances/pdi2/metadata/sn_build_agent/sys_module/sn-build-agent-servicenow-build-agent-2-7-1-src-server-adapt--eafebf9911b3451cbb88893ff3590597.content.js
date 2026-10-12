// REST adapters for conversation activity reads and the execution agent's terminal
// declaration. Zero logic, no GlideRecord — parse -> engine ->
// envelope, same as plans.ts. The platform wraps every response body in {result} on
// the wire, so success bodies here are the bare DTO.
import { onReportOutcome, getConversationAnchor, getWorkItem, readActivity, readConversationActivity } from '../../engine/index.ts';
import { failError, rejectIfNotAE } from './plans.ts';
export function getConversationActivity(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        const result = readConversationActivity(req.pathParams?.conversation_sys_id ?? '');
        if (result.status === 'conversation_not_found') {
            res.setStatus(404);
            res.setBody({ error: 'conversation not found', code: 'conversation_not_found', details: [] });
            return;
        }
        if (result.status === 'activity_not_found') {
            res.setStatus(404);
            res.setBody({ error: 'conversation has no activity', code: 'activity_not_found', details: [] });
            return;
        }
        res.setStatus(200);
        res.setBody(result.activity);
    }
    catch (e) {
        failError(res, e);
    }
}
export function getActivityById(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        const result = readActivity(req.pathParams?.activity_sys_id ?? '');
        if (!result) {
            res.setStatus(404);
            res.setBody({ error: 'activity not found', code: 'activity_not_found', details: [] });
            return;
        }
        res.setStatus(200);
        res.setBody(result);
    }
    catch (e) {
        failError(res, e);
    }
}
// The execution agent's terminal declaration — conversation-keyed, not
// item-keyed: the agent holds its run's `cid`, not the item id. Body-validated
// here (outcome ∈ {done, blocked}, summary required) before the engine call;
// the engine itself re-validates outcome (defense in depth for non-REST
// callers) and drops silently when the newest-run/in_progress fence fails —
// that drop is intentionally NOT surfaced as an error here (idempotent
// no-op), only an unresolvable conversation (no anchor, or an anchor with no work
// item — e.g. a plan-level chat) is 404. No GlideRecord state writes in this
// handler: onReportOutcome and getWorkItem are the only calls that touch
// state/read state, both engine functions.
export function postReportOutcome(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        const data = req.body?.data ?? {};
        const outcome = data.outcome;
        const summary = data.summary;
        const details = [];
        if (outcome !== 'done' && outcome !== 'blocked')
            details.push("outcome must be 'done' or 'blocked'");
        if (!summary)
            details.push('summary is required');
        if (details.length) {
            res.setStatus(400);
            res.setBody({ error: 'invalid report_outcome body', code: 'validation_failed', details });
            return;
        }
        const cid = req.pathParams?.conversation_sys_id ?? '';
        const anchor = getConversationAnchor(cid);
        if (!anchor.anchored || !anchor.work_item) {
            res.setStatus(404);
            res.setBody({ error: 'conversation not found', code: 'not_found', details: [] });
            return;
        }
        onReportOutcome(cid, { outcome, summary });
        res.setStatus(200);
        res.setBody(getWorkItem(anchor.work_item.sys_id) ?? { ok: true });
    }
    catch (e) {
        failError(res, e);
    }
}
