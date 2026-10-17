const TERMINAL = ['completed', 'cancelled'];
function isTerminal(state) {
    return TERMINAL.includes(state);
}
// `canValidate` (draft →) and `canApprove` (in_review →) are gone. Both verbs were
// renamed — validate → approve and approve → accept — and both guards now live
// inline on the entity, checked against the transition table by
// WorkItem.transitionTo. Leaving a predicate called `canApprove` that answers for
// `in_review` would keep the OLD meaning of approve alive next to the new one,
// which is the exact ambiguity the rename exists to remove.
// execute is a two-concern verb: a state guard and a plan-state gate, kept as
// separate predicates so the caller maps each to its own error code without
// re-checking either half. From a non-ready source → 409 invalid_state; from
// ready while either plan switch is off → 409 blocked_plan_state.
export function canExecuteFrom(state) {
    return state === 'ready';
}
// The human Start obeys the SAME both-switches rule the agent dispatch gate
// enforces (workflow/dispatch.ts): the ROOT plan and the item's owning sub-plan
// must each be in_progress. For a root-owned item the caller passes the same
// value twice. String-typed on purpose — the caller resolves the states off raw
// rows, and anything off-vocabulary must read as "not running", never permission.
export function planStateAllowsStart(rootState, owningPlanState) {
    return rootState === 'in_progress' && owningPlanState === 'in_progress';
}
// execute is the HUMAN Start, so it has a third concern: an executor_type gate, exactly
// mirroring finish's. An agent item is never started by hand — its run is dispatched
// as the side effect of the (waiting → ready) transition — and letting one through
// here would land it in_progress with no run behind it and no legal verb but stop.
export function executorCanStart(executor_type) {
    return executor_type === 'human';
}
// finish is likewise two concerns: a state guard and an executor_type gate. From a
// non-in_progress source → 409 invalid_state; the human path only (an agent run
// reaches in_review through report_outcome, never this verb) → 400 validation.
export function canFinishFrom(state) {
    return state === 'in_progress';
}
export function executorCanFinish(executor_type) {
    return executor_type === 'human';
}
// stop: in_progress → needs_attention(stopped).
export function canStop(state) {
    return state === 'in_progress';
}
// cancel: any non-terminal → cancelled. Terminal is absorbing.
export function canCancel(state) {
    return !isTerminal(state);
}
// reopen: → draft from any non-terminal, non-running source. draft has nothing
// to reopen; in_progress (agent self-return) is deferred; terminals are absorbing.
export function canReopen(state) {
    return state === 'waiting' || state === 'ready' || state === 'needs_attention' || state === 'in_review';
}
// Two callers refuse on this predicate — the verb (which asks FIRST, so a replay is
// refused before a conversation is minted) and the entity (which owns the invariant).
// The message ships with the predicate for the same reason the predicate is shared: two
// copies of the sentence drift the moment the legal set changes.
export const REOPEN_ILLEGAL_STATE = 'reopen is legal only from waiting, ready, needs_attention, or in_review';
// rollback: completed only. This is unsupported implementation drift from the
// approved terminal-state contract; removal is tracked in
// docs/autoeng/backlog.md#remove-the-unsupported-work-item-rollback-api.
// Broadening it to other states would widen that drift.
// Cascade DEPENDENTS swept into a rollback's blast radius are NOT gated by
// this predicate — see engine/verbs.ts's rollback, which transitions them via
// the bare transitionTo door instead, since a dependent may legitimately be
// waiting/ready/in_review/needs_attention/completed when it's caught up in
// the cascade, all of which already have a legal -> draft pair (reopen's four
// plus this one).
export function canRollback(state) {
    return state === 'completed';
}
export const ROLLBACK_ILLEGAL_STATE = 'rollback is legal only from completed';
