/// <reference path="../../foundry/glideBridge.d.ts" />
// REST adapters: parse → engine → envelope. Zero logic, no GlideRecord.
// The platform wraps every response body in {result} on the wire — so success
// bodies are the bare DTO; error bodies keep the { error, code, details } shape
// (they arrive wrapped the same way).
import { gs } from '@servicenow/glide';
import { VariantSelection } from '@servicenow/glide/sn_build_agent';
import { parseNonNegativeInt, parseSortOrder } from '../../shared/queryParams.ts';
import { chargeAssist, AE_WORK_ITEM_CREATION_CAPABILITY } from '../../glide/assistBilling.ts';
import { createPlan, getPlan, getPlanByNumber, listPlans, listPlanChildren, updatePlan, executePlan, holdPlan, resumeSubPlan, reviewMilestone, acceptPlan, releasePlan, listPlanArtifacts, cancelPlan, deletePlan, createWorkItem, getWorkItem, getWorkItemByNumber, listWorkItems, listWorkItemArtifacts, approve, execute, finish, accept, reopen, stop, cancel, updateWorkItem, getDependencies, addDependency, removeDependency, previewRollback, rollback, deleteWorkItem, recordAtfTest, getTestManifest as getTestManifestEngine, PlanNotFoundError, WorkItemNotFoundError, DependencyNotFoundError, InvalidStateError, ValidationError, BlockedPlanStateError, CascadeDepthExceededError, CheckpointRestoreError, DependentRunningError } from '../../engine/index.ts';
// Coerce a possibly-array-or-string-or-undefined query param down to a single
// native JS string. String(...), not bare `value || ''`: confirmed live that a
// query param arrives as a Java-bridged string object, and `===` against a JS
// string literal silently fails for it.
function firstQueryParam(value) {
    if (value instanceof Array)
        return value[0] !== undefined && value[0] !== null ? String(value[0]) : '';
    return value !== undefined && value !== null ? String(value) : '';
}
// GET /plans's own sortOrder vocabulary (DEF0897158) — see domain/plan.ts's
// PlanSortOrder for why this is one string rather than separate field/direction
// params, and why 'label' sorts on `number` rather than `short_description`.
const PLAN_SORT_ORDERS = new Set(['updated_asc', 'updated_desc', 'created_asc', 'created_desc', 'label_asc', 'label_desc']);
// Returns true when AE is NOT installed, after writing the 403 response.
// Usage: `if (rejectIfNotAE(res)) return;` at the top of every adapter.
export function rejectIfNotAE(res) {
    if (!VariantSelection.isAutonomousEngineer()) {
        res.setStatus(403);
        res.setBody({ error: 'Autonomous Engineer (sn_autonomous_eng) is required to use this endpoint', code: 'ae_required' });
        return true;
    }
    return false;
}
function fail(res, status, code, error, details = []) {
    res.setStatus(status);
    res.setBody({ error, code, details });
}
// 409 conflict: the record's current state is included so the client re-renders
// without a follow-up read (contract invariant: every 409 carries current facts).
function failConflict(res, e) {
    res.setStatus(409);
    res.setBody({ error: e.message, code: 'invalid_state', state: e.state });
}
// Shared error → HTTP mapping for every adapter. Typed engine errors map to their
// contracted status/body; not-found → 404, blocked_plan_state/invalid_state/
// dependent_running → 409 (each carrying the record's current facts), domain rule → 400
// validation_failed. Anything unrecognized is a bug or platform fault, not a
// client error, so it maps to 500 internal_error — never a 400 that would invite
// the client to “fix” and retry a request the server actually mishandled.
export function failError(res, e) {
    if (e instanceof WorkItemNotFoundError || e instanceof PlanNotFoundError || e instanceof DependencyNotFoundError)
        return fail(res, 404, 'not_found', String(e.message));
    if (e instanceof BlockedPlanStateError) {
        res.setStatus(409);
        res.setBody({ error: e.message, code: 'blocked_plan_state', state: e.state, plan_state: e.plan_state });
        return;
    }
    if (e instanceof InvalidStateError)
        return failConflict(res, e);
    if (e instanceof ValidationError)
        return fail(res, 400, 'validation_failed', String(e.message));
    if (e instanceof CascadeDepthExceededError) {
        res.setStatus(409);
        res.setBody({ error: e.message, code: 'cascade_depth_exceeded', max_depth: e.maxDepth });
        return;
    }
    if (e instanceof DependentRunningError) {
        res.setStatus(409);
        res.setBody({ error: e.message, code: 'dependent_running', dependent_ids: e.dependentIds });
        return;
    }
    // 500, not a 4xx: nothing about the request was wrong and retrying it
    // unchanged is the right move once the chain is healthy. It gets its own code
    // anyway so the failing leg is identifiable, since the alternative is the
    // catch-all internal_error.
    if (e instanceof CheckpointRestoreError) {
        res.setStatus(500);
        res.setBody({ error: e.message, code: 'checkpoint_restore_failed', work_item: e.workItemId });
        return;
    }
    return fail(res, 500, 'internal_error', String(e?.message ?? e));
}
export function postPlan(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        const data = req.body?.data ?? {};
        const dto = createPlan(data);
        res.setStatus(201);
        res.setBody(dto);
    }
    catch (e) {
        failError(res, e);
    }
}
// GET /plans — optional created_by filter ('me' resolves to the session user),
// plus limit/offset/sortOrder, all additive. 'me' resolves via
// gs.getUser().getName(): gs.getUserNameByUserID() is blocked by script fencing
// in this scope, and bare gs.getUserName() was observed returning a value that
// never matched sys_created_by here (both confirmed live).
export function getPlans(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        const createdBy = firstQueryParam(req.queryParams?.created_by);
        const resolvedCreatedBy = createdBy === 'me' ? gs.getUser().getName() : createdBy;
        const limit = parseNonNegativeInt(firstQueryParam(req.queryParams?.limit), 100);
        const offset = parseNonNegativeInt(firstQueryParam(req.queryParams?.offset));
        const sortOrder = parseSortOrder(firstQueryParam(req.queryParams?.sortOrder), PLAN_SORT_ORDERS);
        res.setStatus(200);
        res.setBody(listPlans({
            createdBy: createdBy ? resolvedCreatedBy : undefined,
            limit,
            offset,
            sortOrder
        }));
    }
    catch (e) {
        failError(res, e);
    }
}
export function getPlanBySysId(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        const dto = getPlan(req.pathParams?.sys_id ?? '');
        if (!dto)
            return fail(res, 404, 'not_found', 'plan not found');
        res.setStatus(200);
        res.setBody(dto);
    }
    catch (e) {
        failError(res, e);
    }
}
export function getPlanByNumberRoute(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        res.setStatus(200);
        res.setBody(getPlanByNumber(req.pathParams?.number ?? ''));
    }
    catch (e) {
        failError(res, e);
    }
}
export function getPlanChildren(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        res.setStatus(200);
        res.setBody(listPlanChildren(req.pathParams?.sys_id ?? ''));
    }
    catch (e) {
        failError(res, e);
    }
}
// GET /plans/{id}/work-items — every item in the plan, per-item state and
// executor_type. 404 on a missing plan; a plan with no items returns 200 [].
export function getPlanWorkItems(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        const sysId = req.pathParams?.sys_id ?? '';
        if (!getPlan(sysId))
            return fail(res, 404, 'not_found', 'plan not found');
        res.setStatus(200);
        res.setBody(listWorkItems(sysId));
    }
    catch (e) {
        failError(res, e);
    }
}
// GET /plans/{id}/artifacts — this plan's own file attachments, projected as
// artifacts. Strict to this plan (no sub-plan recursion). 404 on a missing plan
// arrives via `listPlanArtifacts` → `Plan.load` throwing `PlanNotFoundError`,
// caught below like every other plan-scoped adapter here.
export function getPlanArtifacts(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        res.setStatus(200);
        res.setBody(listPlanArtifacts(req.pathParams?.sys_id ?? ''));
    }
    catch (e) {
        failError(res, e);
    }
}
// PATCH /plans/{id} — content-only; state and started_by are never
// patchable (the engine whitelists content fields). 404 on a missing plan.
export function patchPlan(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        res.setStatus(200);
        res.setBody(updatePlan(req.pathParams?.sys_id ?? '', req.body?.data ?? {}));
    }
    catch (e) {
        failError(res, e);
    }
}
// Variant of the runVerb dispatch helper for verbs that dispatch to an agent
// runner: the caller's identity threads through as the run's execution principal,
// minted from the platform session rather than the body.
function runVerbP(req, res, verb) {
    try {
        res.setStatus(200);
        res.setBody(verb(req.pathParams?.sys_id ?? '', gs.getUserID()));
    }
    catch (e) {
        failError(res, e);
    }
}
// Execute, Hold, and Resume are empty-result plan state/gate verbs, so their
// success body is an EMPTY OBJECT — `{}`, deliberately, never an absent body:
// the webview's transport dereferences the response body (glideUtils.ts), and an
// absent body would report a verb that WORKED as a failure. Review, Finalize
// (`accept`), Release, and Cancel return their typed results directly instead.
function runPlanIntentVerb(res, verb) {
    try {
        verb();
        res.setStatus(200);
        res.setBody({});
    }
    catch (e) {
        failError(res, e);
    }
}
export function postPlanExecute(req, res) {
    if (rejectIfNotAE(res))
        return;
    runPlanIntentVerb(res, () => executePlan(req.pathParams?.sys_id ?? '', gs.getUserID(), {
        atfWithApp: req.body?.data?.atfWithApp === true,
        // Only meaningful nested under atfWithApp — re-applied here rather
        // than trusting the caller, same nesting the interactive path enforces
        // in NirvanaWebSocketClient.buildClientCapabilities().
        atfWithAppRunUi: req.body?.data?.atfWithApp === true && req.body?.data?.atfWithAppRunUi === true
    }));
}
export function postPlanHold(req, res) {
    if (rejectIfNotAE(res))
        return;
    runPlanIntentVerb(res, () => holdPlan(req.pathParams?.sys_id ?? ''));
}
// POST /plans/{id}/resume — the one verb that targets a SUB-plan; same
// empty-body success contract as execute/hold.
export function postPlanResume(req, res) {
    if (rejectIfNotAE(res))
        return;
    runPlanIntentVerb(res, () => resumeSubPlan(req.pathParams?.sys_id ?? '', gs.getUserID()));
}
// POST /plans/{id}/review — bulk milestone review, {accept:[ids]}.
// 200 with the partial-failure result; a not-in_review plan maps to 409
// invalid_state like every other verb.
export function postPlanReview(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        const data = req.body?.data ?? {};
        res.setStatus(200);
        res.setBody(reviewMilestone(req.pathParams?.sys_id ?? '', { accept: data.accept }, gs.getUserID()));
    }
    catch (e) {
        failError(res, e);
    }
}
// POST /plans/{id}/accept — the ceremony; 200 with the completed PlanDto plus
// the release outcome.
export function postPlanAccept(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        res.setStatus(200);
        res.setBody(acceptPlan(req.pathParams?.sys_id ?? '', gs.getUserID()));
    }
    catch (e) {
        failError(res, e);
    }
}
// POST /plans/{id}/release — the standalone, idempotent release retry.
export function postPlanRelease(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        res.setStatus(200);
        res.setBody(releasePlan(req.pathParams?.sys_id ?? ''));
    }
    catch (e) {
        failError(res, e);
    }
}
// POST /plans/{id}/cancel — cascades cancel() to every non-terminal item in
// the plan and lands the plan itself in `cancelled`. Root-only: a 409 naming
// the root when aimed at a sub-plan, via the SAME assertRootVerb guard the
// other plan verbs use (see engine/plans.ts's cancelPlan). Flat response body —
// {cancelled, failed} — mirroring rollback's partial-failure shape. Execute,
// Hold, and Resume use the empty-body {} contract; Review, Finalize (`accept`),
// Release, and Cancel have typed result bodies because they report outcomes.
export function postPlanCancel(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        res.setStatus(200);
        res.setBody(cancelPlan(req.pathParams?.sys_id ?? '', gs.getUserID()));
    }
    catch (e) {
        failError(res, e);
    }
}
// DELETE /plans/{id} — remove the plan, its descendants, and every work item
// in that scope. An observed in-progress turn is interrupted and cancelled as part
// of deletion. 404 on a missing plan; platform/cleanup failures map to 500.
//
// 204 carries no body. GlideUtils handles that status before dereferencing the
// platform's `{result}` envelope, so host callers do not misreport success as failure.
export function deletePlanById(req, res) {
    // Purposely omitted rejectIfNotAE: a plan delete is a cleanup operation, not an AE feature.
    try {
        deletePlan(req.pathParams?.id ?? '');
        res.setStatus(204);
    }
    catch (e) {
        failError(res, e);
    }
}
// DELETE /work-items/{id} — remove one item, both directions of dependency edges,
// activity, and attachments. An observed in-progress turn is interrupted and
// cancelled first. 404 on a missing item; platform/cleanup failures map to 500.
export function deleteWorkItemById(req, res) {
    // Purposely omitted rejectIfNotAE: a plan delete is a cleanup operation, not an AE feature.
    try {
        deleteWorkItem(req.pathParams?.id ?? '');
        res.setStatus(204);
    }
    catch (e) {
        failError(res, e);
    }
}
export function postWorkItem(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        const data = req.body?.data ?? {};
        const dto = createWorkItem({ ...data, plan: { sys_id: req.pathParams?.sys_id ?? '' } });
        res.setStatus(201);
        res.setBody(dto);
        chargeAssist(AE_WORK_ITEM_CREATION_CAPABILITY);
    }
    catch (e) {
        failError(res, e);
    }
}
export function getWorkItemDependencies(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        res.setStatus(200);
        res.setBody(getDependencies(req.pathParams?.sys_id ?? ''));
    }
    catch (e) {
        failError(res, e);
    }
}
export function postWorkItemDependency(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        const dto = addDependency(req.pathParams?.sys_id ?? '', req.body?.data?.depends_on);
        res.setStatus(201);
        res.setBody(dto);
    }
    catch (e) {
        failError(res, e);
    }
}
export function deleteWorkItemDependency(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        removeDependency(req.pathParams?.sys_id ?? '', req.pathParams?.dependency_sys_id ?? '');
        res.setStatus(204);
    }
    catch (e) {
        failError(res, e);
    }
}
// GET /work-items/{id} — content, the derived current-attention projection, and
// the item's activity collection. Activity is assembled from
// sn_build_agent_activity; it is not stored on the work-item row.
// 404 on a miss.
export function getWorkItemBySysId(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        const dto = getWorkItem(req.pathParams?.sys_id ?? '');
        if (!dto)
            return fail(res, 404, 'not_found', 'work item not found');
        res.setStatus(200);
        res.setBody(dto);
    }
    catch (e) {
        failError(res, e);
    }
}
export function getWorkItemByNumberRoute(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        res.setStatus(200);
        res.setBody(getWorkItemByNumber(req.pathParams?.number ?? ''));
    }
    catch (e) {
        failError(res, e);
    }
}
// GET /work-items/{id}/artifacts — this work item's own file attachments,
// projected as artifacts. 404 on a missing work item arrives via
// `listWorkItemArtifacts` → `WorkItem.load` throwing `WorkItemNotFoundError`,
// caught below like every other work-item-scoped adapter here.
export function getWorkItemArtifacts(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        res.setStatus(200);
        res.setBody(listWorkItemArtifacts(req.pathParams?.sys_id ?? ''));
    }
    catch (e) {
        failError(res, e);
    }
}
// The work-item lifecycle verbs: each is verb-guard → transition → cascade in the
// engine; the adapter only parses the id and maps errors. Success is 200 with the
// current DTO (the platform adds the {result} envelope).
function runVerb(req, res, verb) {
    try {
        res.setStatus(200);
        res.setBody(verb(req.pathParams?.sys_id ?? ''));
    }
    catch (e) {
        failError(res, e);
    }
}
// POST /work-items/{id}/approve — the spec agent asserts the specification is
// sufficient to execute. draft → waiting, ALWAYS; readiness and dispatch follow as
// the transition's side effects.
export function postApprove(req, res) {
    if (rejectIfNotAE(res))
        return;
    runVerb(req, res, approve);
}
export function postExecute(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        res.setStatus(200);
        res.setBody(execute(req.pathParams?.sys_id ?? '', gs.getUserID()));
    }
    catch (e) {
        failError(res, e);
    }
}
export function postFinish(req, res) {
    if (rejectIfNotAE(res))
        return;
    runVerb(req, res, finish);
}
// POST /work-items/{id}/accept — the Builder accepts the delivered work.
// in_review → completed. Carries the session principal so the engine records
// the "Accepted by" audit row.
export function postAccept(req, res) {
    if (rejectIfNotAE(res))
        return;
    runVerbP(req, res, accept);
}
// Reopen needs a principal (unlike the other plain-runVerb verbs) to mint the rework
// conversation's Foundry token. Its result names both affected resources explicitly:
// `{work_item, rework_activity}`. The client opens the conversation on that exact
// activity; no conversation field is projected onto the work item.
export function postReopen(req, res) {
    if (rejectIfNotAE(res))
        return;
    runVerbP(req, res, reopen);
}
export function postStop(req, res) {
    if (rejectIfNotAE(res))
        return;
    runVerb(req, res, stop);
}
export function postCancel(req, res) {
    if (rejectIfNotAE(res))
        return;
    runVerb(req, res, cancel);
}
// PATCH /work-items/{id} — content-only, draft-only; state is never patchable
// (the engine whitelists content fields and rejects a non-draft item with 409).
export function patchWorkItem(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        const data = req.body?.data ?? {};
        res.setStatus(200);
        res.setBody(updateWorkItem(req.pathParams?.sys_id ?? '', data));
    }
    catch (e) {
        failError(res, e);
    }
}
// POST /work-items/{id}/rollback[?preview=true] — undoes a completed work
// item's agent-authored changes by INITIATING a Checkpoint 0 restore for it
// (and every transitive dependent) in reverse-dependency order. preview=true
// returns the blast radius without changing anything; without it, initiates
// the cascade (partial-rollback semantics — see engine/verbs.ts's rollback;
// each item's restore is started, not confirmed complete, before the next
// one begins).
//
// Optional body field `reason` (string) — recorded on the rolled_back
// activity for the root item; cascaded dependents get an auto-generated
// "<reason> — dependency cascade from <root>" reason. Optional query param
// `max_depth` (int) — confirms a wider rollback when the default cascade
// depth (5) is exceeded; execute rejects with cascade_depth_exceeded whenever
// the blast radius still exceeds whatever depth (default or explicit) was
// actually attempted.
export function postWorkItemRollback(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        const id = req.pathParams?.sys_id ?? '';
        // Scripted REST APIs deliver REPEATED query params as arrays (e.g.
        // ?preview=true&preview=false arrives as ['true','false']), not plain
        // strings. Coerce before parsing so a duplicated/empty param can't fall
        // through to the wrong branch (e.g. String(['true','false']) ===
        // 'true,false', which fails the preview check and would otherwise
        // silently fall into the destructive execute path).
        const previewParam = firstQueryParam(req.queryParams?.preview);
        const maxDepthParam = firstQueryParam(req.queryParams?.max_depth);
        let maxDepth;
        if (maxDepthParam !== '') {
            const parsed = parseInt(maxDepthParam, 10);
            if (isNaN(parsed) || parsed < 1)
                return fail(res, 400, 'validation_failed', 'max_depth must be a positive integer');
            maxDepth = parsed;
        }
        if (previewParam.toLowerCase() === 'true') {
            res.setStatus(200);
            res.setBody(previewRollback(id, maxDepth));
            return;
        }
        const reason = req.body?.data?.reason ?? '';
        res.setStatus(200);
        res.setBody(rollback(id, reason, maxDepth));
    }
    catch (e) {
        failError(res, e);
    }
}
// POST /work-items/{id}/atf-tests — records that an agent created an ATF test
export function postRecordAtfTest(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        const workItemId = req.pathParams?.sys_id ?? '';
        const data = req.body?.data;
        if (!data?.test_result_sys_id)
            return fail(res, 400, 'validation_failed', 'test_result_sys_id is required');
        res.setStatus(201);
        res.setBody(recordAtfTest(workItemId, {
            test_result_sys_id: data.test_result_sys_id,
            test_output: data.test_output,
            report: data.report
        }));
    }
    catch (e) {
        failError(res, e);
    }
}
// GET /work-items/{id}/test-manifest — gets test manifest for work item
export function getWorkItemTestManifest(req, res) {
    if (rejectIfNotAE(res))
        return;
    try {
        const workItemId = req.pathParams?.sys_id ?? '';
        res.setStatus(200);
        res.setBody(getTestManifestEngine(workItemId));
    }
    catch (e) {
        failError(res, e);
    }
}
