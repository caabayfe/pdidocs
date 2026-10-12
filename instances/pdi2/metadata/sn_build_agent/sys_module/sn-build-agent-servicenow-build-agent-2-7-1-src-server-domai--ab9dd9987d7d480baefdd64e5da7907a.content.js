// src/server/domain/plan.ts
// Active Record over the plan row and the persisted five-state lifecycle.
// `Plan` imports `WorkItem`; `WorkItem` never imports `Plan` — that one-way
// rule keeps the entities acyclic. A plan state change only opens/closes the
// dispatch gate — no child cascade lives here. Plan status is never stored:
// item_counts is computed at read time over the descendant scope.
import { gs } from '@servicenow/glide';
import * as records from '../glide/records.ts';
import * as activity from '../glide/activity.ts';
import { deleteAttachments, listAttachments } from '../glide/attachments.ts';
import { createPlanUpdateSet, resolvePlanUpdateSet, toUpdateSetDto } from '../glide/updateSets.ts';
import { WorkItem } from './workItem.ts';
import { isLegal as isLegalPlanTransition } from '../workflow/planTransitions.ts';
import { InvalidStateError, PlanNotFoundError, ValidationError } from '../shared/errors.ts';
import { planStateOf, stateName } from '../shared/states.ts';
import { planReferenceFromSysId, resolvePlanReference } from './recordReferences.ts';
import { applySort, applyWindow } from './listQuery.ts';
const PLAN_TABLE = 'sn_build_agent_plan';
const WI_TABLE = 'sn_build_agent_work_item';
function s(gr, field) {
    return String(gr.getValue(field) ?? '');
}
// `number` is always populated (dictionary default on insert), so no sys_id
// fallback is needed for the label sort.
const SORT_COLUMN = {
    updated: 'sys_updated_on',
    created: 'sys_created_on',
    label: 'number'
};
export class Plan {
    gr;
    constructor(gr) {
        this.gr = gr;
    }
    // ------------------------------------------------------------ construction
    static tryLoad(sysId) {
        if (!sysId)
            return null;
        const gr = records.newRecord(PLAN_TABLE);
        return gr.get('sys_id', sysId) ? new Plan(gr) : null;
    }
    static load(sysId) {
        const p = Plan.tryLoad(sysId);
        if (!p)
            throw new PlanNotFoundError(sysId ?? '');
        return p;
    }
    static resolve(reference) {
        return Plan.load(resolvePlanReference(reference).sys_id);
    }
    // Nesting is capped at two levels. A row is born standby with started_by
    // empty — that emptiness IS the never-started fact.
    static create(input) {
        if (!input.short_description?.trim())
            throw new ValidationError('short_description is required');
        const parent = input.parent_plan ? Plan.resolve(input.parent_plan) : null;
        if (parent) {
            // Root listings omit sub-plans; a deeper child would be unreachable via the API.
            if (parent.parent_plan_sys_id)
                throw new ValidationError('parent_plan already has a parent — a sub-plan cannot itself be a parent (max two levels)');
            if (parent.state === 'completed' || parent.state === 'cancelled') {
                throw new ValidationError(`sub-plans cannot be created under a ${parent.state} plan`);
            }
            // Update sets are ensured at write time only, never as a side effect of a read.
            parent.ensureUpdateSet();
        }
        const gr = records.newRecord(PLAN_TABLE);
        gr.newRecord();
        gr.setValue('short_description', input.short_description.trim());
        gr.setValue('description', input.description ?? '');
        if (parent)
            gr.setValue('parent_plan', parent.sys_id);
        gr.setValue('state', 'standby');
        // A root's set is global-scoped; a sub-plan's is re-parented under its root's
        // set (ensureUpdateSet above guarantees parent.batch_update_set is non-empty).
        gr.setValue('batch_update_set', createPlanUpdateSet(input.short_description.trim(), parent?.batch_update_set));
        const id = gr.insert();
        // A falsy insert is a platform/db fault → 500 internal_error, not a 400.
        if (!id)
            throw new Error('plan insert failed');
        return Plan.load(String(id));
    }
    // Root-plan listing. `createdBy` filters on sys_created_by; the caller resolves
    // the 'me' sentinel — the domain never interprets it. limit/offset/sortOrder are
    // additive: when omitted, behavior is unfiltered/unpaginated/default-order
    // (`order`, unrelated to sortOrder).
    static all(options = {}) {
        const { createdBy, limit, offset, sortOrder } = options;
        const out = [];
        const gr = records.newRecord(PLAN_TABLE);
        gr.addNullQuery('parent_plan');
        if (createdBy)
            gr.addQuery('sys_created_by', createdBy);
        applySort(gr, sortOrder, SORT_COLUMN, 'order');
        applyWindow(gr, limit, offset);
        gr.query();
        while (gr.next())
            out.push(new Plan(gr).toDto());
        return out;
    }
    // --------------------------------------------------------------- getters
    get sys_id() {
        return this.gr.getUniqueValue();
    }
    get reference() {
        return { sys_id: this.sys_id, number: this.number };
    }
    get number() {
        return s(this.gr, 'number');
    }
    get short_description() {
        return s(this.gr, 'short_description');
    }
    get description() {
        return s(this.gr, 'description');
    }
    // Only create() and the door below write state; an unrecognized or missing
    // value is corrupt data and THROWS, never coerces.
    get state() {
        return planStateOf(this.gr.getValue('state'), `plan ${this.sys_id}`);
    }
    get started_by() {
        return s(this.gr, 'started_by');
    }
    get created_by() {
        return s(this.gr, 'sys_created_by');
    }
    get parent_plan_sys_id() {
        return s(this.gr, 'parent_plan');
    }
    get parent_plan() {
        return this.parent_plan_sys_id ? planReferenceFromSysId(this.parent_plan_sys_id) : null;
    }
    get batch_update_set() {
        return s(this.gr, 'batch_update_set');
    }
    get order() {
        return Number(this.gr.getValue('order') ?? 0);
    }
    get updated() {
        return s(this.gr, 'sys_updated_on');
    }
    // --------------------------------------------------------------- to wire
    toDto() {
        return {
            sys_id: this.sys_id,
            number: this.number,
            short_description: this.short_description,
            description: this.description,
            state: this.state,
            started_by: this.started_by,
            created_by: this.created_by,
            parent_plan: this.parent_plan,
            order: this.order,
            updated: this.updated,
            item_counts: this.itemCounts(),
            // Stubs populated only by engine/plans.ts#getPlan.
            activated_on: '',
            completed_on: '',
            update_set: this.updateSetDto()
        };
    }
    // ---------------------------------------------------------- verb guard
    // Root-only: a plan verb aimed at a sub-plan is a 409 naming the root. The 409
    // carries this plan's CURRENT state — `state` must never echo back anything the
    // caller requested but that was not applied. (Sub-plan Resume deliberately
    // skips this guard.)
    assertRootVerb() {
        if (this.parent_plan) {
            throw new InvalidStateError(`plan verbs are root-only; aim this at ${this.parent_plan.number}`, this.state);
        }
    }
    // ---------------------------------------------------------- lifecycle door
    // THE one write door for plan state on an EXISTING row — nothing else writes
    // `state` (create()'s setValue stamps an INSERT buffer: a creation edge, not a
    // transition). An illegal pair THROWS, carrying this plan's CURRENT state.
    // → in_progress re-stamps started_by when the caller supplies the principal;
    // a non-empty started_by is the persisted "this plan has been activated" bit.
    // The activity row is narration only — a rejected insert is tolerated.
    transitionTo(next, opts) {
        const from = this.state;
        if (!isLegalPlanTransition(from, next)) {
            throw new InvalidStateError(`illegal plan transition ${from} -> ${next}`, from);
        }
        this.gr.setValue('state', next);
        if (next === 'in_progress' && opts?.principal)
            this.gr.setValue('started_by', opts.principal);
        this.gr.update();
        const detail = next === 'standby' && opts?.standbyReason
            ? ` (${opts.standbyReason})`
            : next === 'completed' && opts?.principal
                ? ` (accepted by ${opts.principal})`
                : next === 'cancelled' && opts?.principal
                    ? ` (cancelled by ${opts.principal})`
                    : '';
        activity.insertActivity({
            kind: 'system',
            plan: this.sys_id,
            summary: `Plan moved ${from} → ${next}${detail}`
        });
        return { aggregate: 'plan', id: this.sys_id, from, to: next };
    }
    // Content-only patch; state/started_by are verb-owned, never patchable here.
    updateContent(fields) {
        if (fields.short_description !== undefined && !fields.short_description.trim()) {
            throw new ValidationError('short_description may not be blank');
        }
        if (fields.short_description !== undefined)
            this.gr.setValue('short_description', fields.short_description);
        if (fields.description !== undefined)
            this.gr.setValue('description', fields.description);
        this.gr.update();
        return this;
    }
    // -------------------------------------------------------------- internals
    // A pure read: a plan's loadability must never depend on this record resolving.
    // null when batch_update_set is empty — update sets are ensured write-time
    // only, never on a read.
    updateSetDto() {
        const row = resolvePlanUpdateSet(this.batch_update_set);
        return row ? toUpdateSetDto(row) : null;
    }
    // Counts and list reads share one descendant scope. Normal API-created trees have
    // one child level; the recursive walk also keeps imported deeper trees reachable.
    itemCounts() {
        const descendantIds = this.descendantPlanIds();
        return descendantIds.length ? countsFor([this.sys_id, ...descendantIds]) : countsFor(this.sys_id);
    }
    // The flat list uses the same subtree scope as itemCounts so list and count
    // projections cannot contradict each other.
    workItems() {
        const descendantIds = this.descendantPlanIds();
        return WorkItem.forPlan(descendantIds.length ? [this.sys_id, ...descendantIds] : this.sys_id);
    }
    // Every work-item id in this plan's subtree — used by the delete cascade to scope
    // the per-item delete path before this plan's own rows are removed.
    workItemIds() {
        const planIds = [this.sys_id, ...this.descendantPlanIds()];
        const gr = records.newRecord(WI_TABLE);
        if (planIds.length > 1)
            gr.addQuery('plan', 'IN', planIds.join(','));
        else
            gr.addQuery('plan', planIds[0]);
        gr.query();
        const out = [];
        while (gr.next())
            out.push(gr.getUniqueValue());
        return out;
    }
    children() {
        const out = [];
        const gr = records.newRecord(PLAN_TABLE);
        gr.addQuery('parent_plan', this.sys_id);
        gr.orderBy('order');
        gr.query();
        while (gr.next())
            out.push(new Plan(gr).toDto());
        return out;
    }
    // This plan's own file attachments — no sub-plan recursion, unlike workItems().
    artifacts() {
        return listAttachments(PLAN_TABLE, this.sys_id).map(row => ({ ...row, source: 'uploaded', plan: this.sys_id, work_item: null }));
    }
    // Creates this plan's anchor update set if missing. Called only from
    // Plan.create() — never on a read path; `this` is always a root by construction.
    // Not atomic: two concurrent sub-plan creations under a never-anchored root can
    // orphan one set — accepted trade-off.
    ensureUpdateSet() {
        if (this.batch_update_set)
            return;
        this.gr.setValue('batch_update_set', createPlanUpdateSet(this.short_description));
        this.gr.update();
    }
    // Deletes sub-plans, activity, attachments, then the plan rows, deepest-first.
    // Work items are NOT touched here — the engine deletes them first (engine/
    // plans.ts deletePlan). `sn_build_agent_activity.plan` is MANDATORY, so every
    // activity row naming a plan must go before its plan row. Conversations that
    // reference this plan are deliberately left alone (separate aggregate).
    delete() {
        for (const planId of [...this.descendantPlanIds().reverse(), this.sys_id]) {
            activity.deleteActivityForPlan(planId);
            deleteAttachments(PLAN_TABLE, planId);
            const gr = records.newRecord(PLAN_TABLE);
            if (gr.get('sys_id', planId) && !gr.deleteRecord())
                throw new Error(`plan delete failed: ${planId}`);
        }
    }
    descendantPlanIds() {
        const out = [];
        const visited = new Set([this.sys_id]);
        const pending = [this.sys_id];
        while (pending.length) {
            const parentId = pending.shift();
            const gr = records.newRecord(PLAN_TABLE);
            gr.addQuery('parent_plan', parentId);
            gr.query();
            while (gr.next()) {
                const id = gr.getUniqueValue();
                if (visited.has(id))
                    continue;
                visited.add(id);
                out.push(id);
                pending.push(id);
            }
        }
        return out;
    }
}
// Per-state work-item counts for a plan (or plan set), one GlideAggregate: COUNT
// grouped by state, keyed by state NAME. An item-less plan yields {}.
function countsFor(planIds) {
    const counts = {};
    const ga = records.newAggregate(WI_TABLE);
    if (Array.isArray(planIds))
        ga.addQuery('plan', 'IN', planIds.join(','));
    else
        ga.addQuery('plan', planIds);
    ga.addAggregate('COUNT', 'state');
    ga.groupBy('state');
    ga.query();
    // parseInt(String(...)), not Number(...): the aggregate comes back as a Java
    // Double through the scoped-module bridge, and Number() serialises into the
    // API response as `"draft": 2.0` (confirmed live). The string forces a real
    // integer.
    while (ga.next()) {
        // A stateless row (Number('') === 0) can only come from a raw record import
        // bypassing WorkItem.create(); skip it rather than 500 every plan listing,
        // but log loudly — it means something wrote outside create()/setState().
        const rawState = ga.getValue('state');
        let name;
        try {
            name = stateName(Number(rawState));
        }
        catch {
            gs.error(`[build-agent] countsFor: work item(s) under plan(s) ${Array.isArray(planIds) ? planIds.join(',') : planIds} have an unrecognized state value ${JSON.stringify(rawState)} (count=${String(ga.getAggregate('COUNT', 'state'))}) — likely a row inserted outside WorkItem.create()/setState(); excluded from this plan's item_counts`);
            continue;
        }
        counts[name] = parseInt(String(ga.getAggregate('COUNT', 'state')), 10);
    }
    return counts;
}
