// src/server/domain/workItem.ts
// The fat WorkItem entity: an Active Record that owns the decisions AND the
// persistence for one sn_build_agent_work_item row. It holds ONE positioned
// GlideRecord (this.gr) obtained through the record seam (glide/records.ts);
// ordinary reads use getValue off that buffer; inherited journal history goes
// through the record seam. A transition is setValue…+update() on the same buffer
// (one get + one update, no post-write re-read).
//
// State is symbolic (StateName) everywhere it is read; the only place a numeric
// state integer appears is the record boundary — the read-decode
// (stateName(Number(getValue('state')))) and the write in setState/create (the
// STATE.* literal). Legal-transition guards stay pure and OUTSIDE the entity: the
// (from, to) table is workflow/transitions.ts, checked by the ONE door below
// (transitionTo), with verb-shaped predicates in shared/statePolicy.ts.
//
// The entity owns construction (load/tryLoad/create), the bulk read (forPlan → DTO
// snapshots), reads (getters/toDto), and every lifecycle verb; the thin engine
// barrel delegates here with frozen public signatures.
import * as records from '../glide/records.ts';
import * as activity from '../glide/activity.ts';
import { deleteAttachments, listAttachments } from '../glide/attachments.ts';
import { resolveWorkItemUpdateSets, toUpdateSetDto } from '../glide/updateSets.ts';
// One-way import, the same direction every other consumer uses: WorkItem imports
// domain/dependencies.ts; that module never imports WorkItem (see its header).
import * as deps from './dependencies.ts';
import { STATE, planStateOf, stateName, stateValue } from '../shared/states.ts';
import { isLegal } from '../workflow/transitions.ts';
import { WorkItemNotFoundError, InvalidStateError, BlockedPlanStateError, ValidationError } from '../shared/errors.ts';
import { canExecuteFrom, planStateAllowsStart, executorCanStart, canFinishFrom, executorCanFinish, canStop, canCancel, canReopen, REOPEN_ILLEGAL_STATE, canRollback, ROLLBACK_ILLEGAL_STATE } from '../shared/statePolicy.ts';
import { planReferenceFromSysId, resolvePlanReference, resolveWorkItemReference } from './recordReferences.ts';
const TABLE = 'sn_build_agent_work_item';
const PLAN_TABLE = 'sn_build_agent_plan';
function s(gr, field) {
    return String(gr.getValue(field) ?? '');
}
function executorType(gr) {
    return s(gr, 'executor_type') === 'human' ? 'human' : 'agent';
}
// The plan-row facts item creation validates against, read through the record
// seam so WorkItem keeps its one-way rule (it never imports Plan — see
// domain/plan.ts's header). Missing row → null: the caller has already resolved
// the reference, so this is only a race with a delete.
function planRowOf(planId) {
    const gr = records.newRecord(PLAN_TABLE);
    if (!gr.get('sys_id', planId))
        return null;
    return { state: planStateOf(gr.getValue('state'), `plan ${planId}`), parent_plan: String(gr.getValue('parent_plan') ?? '') };
}
function rootPlanRowOf(planId) {
    const visited = new Set();
    let currentId = planId;
    let current = planRowOf(currentId);
    while (current?.parent_plan && !visited.has(currentId)) {
        visited.add(currentId);
        currentId = current.parent_plan;
        current = planRowOf(currentId);
    }
    return current;
}
export class WorkItem {
    gr;
    // Positioned via load()/create()/tryLoad(); never constructed directly by callers.
    constructor(gr) {
        this.gr = gr;
    }
    // Transient, in-memory only — never read from or written to `gr`. Carries
    // the atf_with_app/atf_with_app_run_ui flags captured at executePlan()
    // time across the single synchronous sweepReadyItems() call that
    // dispatches this item, into effects.ts's dispatch(). Deliberately NOT
    // persisted: a dependent item dispatched later, in a separate transaction
    // (once its prerequisite completes), picks up whatever the caller passes
    // at THAT dispatch instead of whatever was true when the plan was first
    // executed — see the discussion on executePlan's options param.
    //
    // LIMITATION: In multi-step plans, dependent items that become ready after
    // a prerequisite completes are dispatched via releaseDependents → drain,
    // NOT through sweepReadyItems. They never receive these flags, so
    // later-dispatched items in a multi-step plan always run without ATF
    // capabilities regardless of how executePlan was called. This limitation
    // is tested in __tests__/planVerbs.test.ts ("a dependent released via
    // releaseDependents does NOT receive ATF flags").
    dispatchAtfWithApp;
    dispatchAtfWithAppRunUi;
    // ------------------------------------------------------------ construction
    static tryLoad(sysId) {
        if (!sysId)
            return null;
        const gr = records.newRecord(TABLE);
        return gr.get('sys_id', sysId) ? new WorkItem(gr) : null;
    }
    static load(sysId) {
        const wi = WorkItem.tryLoad(sysId);
        if (!wi)
            throw new WorkItemNotFoundError(sysId ?? '');
        return wi;
    }
    static resolve(reference) {
        return WorkItem.load(resolveWorkItemReference(reference).sys_id);
    }
    // Insert-in-draft. Validates required content and that the plan exists, then
    // writes the initial protected state (DRAFT) — the entity owns its own state,
    // so this setValue lives here (the single-writer lint allows the entity files).
    static create(input) {
        if (!input.short_description?.trim())
            throw new ValidationError('short_description is required');
        const plan = resolvePlanReference(input.plan);
        // A terminal plan accepts no new members: accepted history is immutable and
        // a cancelled plan is abandoned, so a new item under either could never run.
        // Refused at the only door that creates membership. (Adding to an in_review
        // plan is LEGAL — the plan regresses to standby via the rollup.)
        const planRow = planRowOf(plan.sys_id);
        const planState = planRow?.state ?? 'standby';
        if (planState === 'completed' || planState === 'cancelled') {
            throw new ValidationError(`work items cannot be added to a ${planState} plan`);
        }
        const rootState = planRow?.parent_plan ? (rootPlanRowOf(plan.sys_id)?.state ?? 'standby') : planState;
        if (planRow?.parent_plan && (rootState === 'completed' || rootState === 'cancelled')) {
            throw new ValidationError(`work items cannot be added under a ${rootState} root plan`);
        }
        // The REST adapter spreads the request body into this input, so `executor_type` arrives
        // unvalidated. An off-vocabulary value is not merely cosmetic: it is neither 'agent'
        // (so execute() flips to in_progress and dispatches nothing) nor 'human' (so
        // finish() refuses), which strands the item in_progress permanently. Reject at the
        // only door that writes the field.
        const executor_type = input.executor_type ?? 'agent';
        if (executor_type !== 'agent' && executor_type !== 'human')
            throw new ValidationError("executor_type must be 'agent' or 'human'");
        const gr = records.newRecord(TABLE);
        gr.newRecord();
        gr.setValue('plan', plan.sys_id);
        gr.setValue('short_description', input.short_description.trim());
        gr.setValue('description', input.description ?? '');
        gr.setValue('acceptance_criteria', input.acceptance_criteria ?? '');
        gr.setValue('executor_type', executor_type);
        gr.setValue('state', String(STATE.DRAFT)); // String() for the same reason as setState — never hand setValue a raw number
        const id = gr.insert();
        // A falsy insert here is a platform/db fault (a work-item insert has no
        // cycle/unique BR that legitimately aborts it), so it is a generic Error →
        // 500 internal_error, NOT a 400 that would invite the client to "fix" input.
        if (!id)
            throw new Error('work item insert failed');
        // Re-load so the returned entity includes database-supplied defaults.
        return WorkItem.load(String(id));
    }
    // Bulk READ: every item in the plan (or plan set, via an IN query) as
    // read-only DTO snapshots. One cursor is one positioned row, so bulk reads
    // return values, not live entities — the N+1 antidote for lists/counts/
    // cascade classification. To ACT on one, WorkItem.load(id) it.
    static forPlan(planIds) {
        const gr = records.newRecord(TABLE);
        if (Array.isArray(planIds))
            gr.addQuery('plan', 'IN', planIds.join(','));
        else
            gr.addQuery('plan', planIds);
        gr.query();
        const out = [];
        while (gr.next())
            out.push(dtoFromCursor(gr));
        const latest = activity.getNewestSettledActivities(out.map(item => item.sys_id));
        return out.map(item => withAttention(item, latest.get(item.sys_id) ?? null));
    }
    // --------------------------------------------------------------- getters
    get sys_id() {
        return this.gr.getUniqueValue();
    }
    get reference() {
        return { sys_id: this.sys_id, number: this.number };
    }
    // Paired with `sys_id` so a WorkItem satisfies shared/label.ts structurally — the verbs
    // hand the entity straight to `label()` rather than restating the fallback.
    get number() {
        return s(this.gr, 'number');
    }
    get plan_sys_id() {
        return s(this.gr, 'plan');
    }
    get plan() {
        return planReferenceFromSysId(this.plan_sys_id);
    }
    get state() {
        return stateName(Number(this.gr.getValue('state')));
    }
    get executor_type() {
        return executorType(this.gr);
    }
    get short_description() {
        return s(this.gr, 'short_description');
    }
    get description() {
        return s(this.gr, 'description');
    }
    get acceptance_criteria() {
        return s(this.gr, 'acceptance_criteria');
    }
    get work_notes() {
        return records.getJournalEntries(this.gr, 'work_notes');
    }
    // --------------------------------------------------------------- to wire
    // The wire/API shape. Current attention is projected from the newest settled
    // activity supplied by the caller; outcomes and summaries are never stored on
    // the work-item row.
    toDto(opts) {
        return withAttention(dtoFromCursor(this.gr), opts?.latestActivity ?? null);
    }
    // This item's own file attachments, projected as artifacts. `plan` is read off
    // this item's own `plan` field (not left blank) and `work_item` is this item's
    // id, so every ArtifactDto row identifies its owning plan regardless of which
    // endpoint produced it.
    artifacts() {
        return listAttachments(TABLE, this.sys_id).map(row => ({ ...row, source: 'uploaded', plan: this.plan_sys_id, work_item: this.sys_id }));
    }
    // This item's FULL run history's output update sets, resolved by walking
    // each run's activity to its conversation's checkpoint chain (see
    // glide/updateSets.ts's resolveWorkItemUpdateSets) and mapped straight to
    // the wire-facing UpdateSetDto via the existing toUpdateSetDto projection.
    // Gated on state the same way the client hides the Update set section:
    // before in_review/completed there is nothing installed worth showing yet,
    // so the chain walk is skipped rather than computed and discarded.
    updateSets() {
        if (this.state !== 'in_review' && this.state !== 'completed')
            return [];
        return resolveWorkItemUpdateSets(this.sys_id).map(toUpdateSetDto);
    }
    // --------------------------------------------------------- lifecycle verbs
    // The single protected-state write: setValue + one update() on this buffer.
    // Numeric encoding of the symbolic target is confined here (the record boundary).
    // Called by `transitionTo` and nothing else — going around the door would skip
    // the legality check, which is the whole point of having one.
    setState(state) {
        // String(), NOT the raw number. A JS number handed to setValue boxes to a Java
        // Double in the scoped-module runtime, so the column stores "10.0" instead of
        // "10". Every engine READ decodes via Number(), so this stayed invisible — but
        // GlideAggregate groups the raw column, so "10" and "10.0" are two groups that
        // countsFor then collapses onto one key, the second silently overwriting the
        // first. item_counts drives every client badge, the progress bar, and hasReady,
        // which gates whether the Execute button renders at all.
        // Existing instances can otherwise contain separate "10" and "10.0" groups.
        this.gr.setValue('state', String(state));
        this.gr.update();
    }
    // THE one door for state. Every state change goes through here: check the
    // (from, to) pair against the transition table, write, and return the pair so
    // the caller can enqueue it for the drain.
    //
    // Nothing else writes `state`. The only other `setValue('state', …)` in the class
    // is create()'s, which stamps DRAFT on an insert buffer — the (null → draft)
    // pre-existence edge, not a transition. An illegal pair THROWS here rather than
    // being written and discovered later.
    transitionTo(next) {
        const from = this.state;
        if (!isLegal(from, next)) {
            throw new InvalidStateError(`illegal transition ${from} -> ${next}`, from);
        }
        this.setState(stateValue(next));
        return { aggregate: 'work_item', id: this.sys_id, from, to: next };
    }
    // The plan facts every start decision reads (both switches must be on): the
    // ROOT plan's lifecycle state, the state of the plan that DIRECTLY owns this
    // item (= rootState for a root-owned item), and the root's started_by (the
    // dispatch principal). Plan.create caps normal trees at two levels; the
    // visited ascent also terminates safely on malformed cycles. Read through the
    // record seam so WorkItem never imports Plan. Missing ancestry reads as
    // standby — anything unresolvable must mean "not running", never permission.
    rootPlanFields() {
        const blocked = { rootState: 'standby', owningPlanState: 'standby', startedBy: '' };
        let planId = this.plan_sys_id;
        let owningPlanState = null;
        const visited = new Set();
        while (planId && !visited.has(planId)) {
            visited.add(planId);
            const gr = records.newRecord(PLAN_TABLE);
            if (!gr.get('sys_id', planId))
                return blocked;
            const state = planStateOf(gr.getValue('state'), `plan ${planId}`);
            if (owningPlanState === null)
                owningPlanState = state;
            const parent = String(gr.getValue('parent_plan') ?? '');
            if (!parent)
                return { rootState: state, owningPlanState, startedBy: String(gr.getValue('started_by') ?? '') };
            planId = parent;
        }
        return blocked;
    }
    // The dispatch principal governing this item's runs = its ROOT plan's started_by
    // (stamped by Execute/Resume).
    // Used by the events resolver to mint a best-effort cancelTurn token ('' fails quietly).
    dispatchPrincipal() {
        return this.rootPlanFields().startedBy;
    }
    // approve — the spec agent asserts the specification is sufficient to execute.
    // It lands `waiting`, ALWAYS. Readiness runs as the transition's side effect and
    // may promote to `ready`; that promotion is what dispatches. This verb never
    // picks the landing state and never dispatches.
    approve() {
        if (this.state !== 'draft') {
            throw new InvalidStateError('approve is legal only from draft', this.state);
        }
        if (!this.short_description) {
            throw new ValidationError('approve requires a short_description');
        }
        return this.transitionTo('waiting');
    }
    // ready → in_progress: the HUMAN Start, and human items ONLY. Three-concern
    // guard, ordered 409s before the 400 (as finish does): state (409
    // invalid_state), the plan-state gate — root AND owning sub-plan in_progress
    // (409 blocked_plan_state), then the executor_type gate (400 validation).
    //
    // An agent item is rejected outright. Dispatch is the side effect of the
    // (waiting → ready) transition now (engine/effects.ts), so starting an agent
    // item by hand would commit in_progress with no run, no activity row, and no
    // legal verb left but stop — the wedge this guard closes.
    execute() {
        this.assertCanExecute();
        return this.transitionTo('in_progress');
    }
    assertCanExecute() {
        if (!canExecuteFrom(this.state))
            throw new InvalidStateError('execute is legal only from ready', this.state);
        const { rootState, owningPlanState } = this.rootPlanFields();
        if (!planStateAllowsStart(rootState, owningPlanState))
            throw new BlockedPlanStateError('execution is blocked by the plan state', this.state, rootState);
        if (!executorCanStart(this.executor_type))
            throw new ValidationError('execute is valid only for human work items — an agent item is dispatched by the engine');
    }
    // The human assignee's Done: in_progress → in_review. State guard precedes the
    // executor_type gate (409 before 400); an agent run reaches in_review via report_outcome
    // (reviewFromRun), never this verb.
    finish() {
        this.assertCanFinish();
        return this.transitionTo('in_review');
    }
    assertCanFinish() {
        if (!canFinishFrom(this.state))
            throw new InvalidStateError('finish is legal only from in_progress', this.state);
        if (!executorCanFinish(this.executor_type))
            throw new ValidationError('finish is valid only for human work items');
    }
    // accept — the Builder judges the delivered work satisfies the acceptance
    // criteria. The side effect re-evaluates dependents.
    accept() {
        if (this.state !== 'in_review') {
            throw new InvalidStateError('accept is legal only from in_review', this.state);
        }
        return this.transitionTo('completed');
    }
    // Entry into needs_attention. The reason and summary are recorded on activity
    // before this method is called; the work item owns only the lifecycle transition.
    // Like every other persisting verb it RETURNS its transition, so the caller can
    // hand it to the pipeline (drain at top level, enqueue when already inside it).
    halt() {
        return this.transitionTo('needs_attention');
    }
    // Run-driven transitions (called by the events resolver, which owns conversation→
    // run→item correlation + newest-run fencing; the entity owns only the row write).
    // reviewFromRun: a completed run / `done` outcome settles in_progress → in_review.
    // The caller persists the declaration on the run activity before invoking this.
    // Job status never calls this method. Returns null when nothing was persisted
    // (the item had already left in_progress), so the caller drains nothing.
    reviewFromRun() {
        if (this.state !== 'in_progress')
            return null;
        return this.transitionTo('in_review');
    }
    // blockedByAgent: report_outcome(blocked) — the agent declared the halt itself.
    blockedByAgent() {
        return this.halt();
    }
    // interrupted: every engine-side end (dispatch failure, cancelled dependency,
    // the human stop below, and eventually the message-stream watchdog).
    interrupted() {
        return this.halt();
    }
    // A human stop is an ENGINE-side end (no agent report_outcome), so it halts as
    // `interrupted`. in_progress only. (Agent cancelTurn-before-flip is deferred.)
    stop() {
        this.assertCanStop();
        return this.halt();
    }
    assertCanStop() {
        if (!canStop(this.state))
            throw new InvalidStateError('stop is legal only from in_progress', this.state);
    }
    // Any non-terminal → cancelled (terminal). Dependent propagation is no longer
    // done here: `→ cancelled` carries the `evaluateDependents` effect,
    // so the drain halts the direct waiting dependents that can never start now.
    cancel() {
        this.assertCanCancel();
        return this.transitionTo('cancelled');
    }
    assertCanCancel() {
        if (!canCancel(this.state))
            throw new InvalidStateError('cancel is legal only from a non-terminal state', this.state);
    }
    // → draft from any non-terminal, non-running source.
    //
    // The rework conversation is not created here. engine/verbs.ts creates it before
    // calling this, so a failed create leaves the item untouched and still reopenable,
    // and the id can be handed back to the client to open. The entity owns only the row
    // write.
    reopen() {
        if (!canReopen(this.state))
            throw new InvalidStateError(REOPEN_ILLEGAL_STATE, this.state);
        return this.transitionTo('draft');
    }
    // → draft from completed only. This method itself performs no restore —
    // it is a guarded single-step door (guard immediately followed by the
    // write), the same shape as reopen() above, and is exercised directly by
    // Task 1's own unit tests. engine/verbs.ts's rollback verb does NOT call
    // this method: it calls assertCanRollback() directly as its up-front
    // guard on the ROOT (before restoring the ROOT's Checkpoint 0 and walking
    // the cascade), then transitions BOTH the root and every cascade
    // dependent to draft through the bare transitionTo door inside its own
    // loop. Cascade dependents can't go through this narrower guard anyway —
    // a dependent swept into the blast radius may legitimately be
    // waiting/ready/in_review/needs_attention/completed, not just completed —
    // so the root's transition goes through the same bare door for
    // consistency with the rest of that loop, rather than through here.
    rollback() {
        this.assertCanRollback();
        return this.transitionTo('draft');
    }
    assertCanRollback() {
        if (!canRollback(this.state))
            throw new InvalidStateError(ROLLBACK_ILLEGAL_STATE, this.state);
    }
    // Content patch, draft-only (the hub all editing returns to, which also closes
    // the approve-vs-edit race). short_description may not be blanked. Only defined
    // keys are written; one update. Content fields are not protected.
    updateContent(fields) {
        if (this.state !== 'draft')
            throw new InvalidStateError('work item content is editable only while draft', this.state);
        if (fields.short_description !== undefined && !fields.short_description.trim()) {
            throw new ValidationError('short_description may not be blank');
        }
        if (fields.short_description !== undefined)
            this.gr.setValue('short_description', fields.short_description);
        if (fields.description !== undefined)
            this.gr.setValue('description', fields.description);
        if (fields.acceptance_criteria !== undefined)
            this.gr.setValue('acceptance_criteria', fields.acceptance_criteria);
        this.gr.update();
        return this;
    }
    // Delete this item and everything that hangs off it, bottom-up so no row is
    // ever left pointing at a parent that is already gone.
    //
    // The order is load-bearing:
    //  1. dependency edges in BOTH directions — a surviving `depends_on` edge makes
    //     readiness halt a healthy sibling as `impossible` (see deleteEdgesTouching).
    //  2. activity rows for this item — `plan` on that table is mandatory, and these
    //     rows are the item's whole run history; nothing reads them once it is gone.
    //  3. attachments on this row — otherwise they stay live in the attachment API
    //     with nothing left that can reach them.
    //  4. the row itself.
    //
    // Conversations remain as independent history aggregates; activity is the only
    // builder-plan/work-item anchor, while conversation.plan references the separate
    // legacy execution-plan table. Platform audit/delete-audit and inherited journal
    // history are retained according to the audited task-table contract.
    //
    // Live-turn cancellation and deletion-specific checkpoint cleanup stay in the
    // engine because they cross aggregate and scope boundaries. They run before this
    // row cascade, and a hard checkpoint cleanup failure prevents entry here.
    delete() {
        const id = this.sys_id;
        deps.deleteEdgesTouching(id);
        activity.deleteActivityForWorkItem(id);
        deleteAttachments(TABLE, id);
        if (!this.gr.deleteRecord())
            throw new Error(`work item delete failed: ${id}`);
    }
}
// Reads the positioned cursor's fields into the wire DTO. Shared by the instance
// toDto (this.gr) and the bulk forPlan (per-row cursor) so there is exactly one
// row→DTO mapping — no dtoAfter overlay, no Row struct.
function dtoFromCursor(gr) {
    return {
        sys_id: gr.getUniqueValue(),
        number: s(gr, 'number'),
        plan: planReferenceFromSysId(s(gr, 'plan')),
        state: stateName(Number(gr.getValue('state'))),
        executor_type: executorType(gr),
        short_description: s(gr, 'short_description'),
        description: s(gr, 'description'),
        acceptance_criteria: s(gr, 'acceptance_criteria'),
        attention_reason: '',
        attention_summary: '',
        updated: s(gr, 'sys_updated_on'),
        assigned_to: s(gr, 'assigned_to')
    };
}
function withAttention(dto, latest) {
    if (dto.state !== 'needs_attention' || !latest || (latest.outcome !== 'blocked' && latest.outcome !== 'interrupted'))
        return dto;
    return { ...dto, attention_reason: latest.outcome, attention_summary: latest.summary };
}
