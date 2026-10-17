const NON_TERMINAL = ['draft', 'waiting', 'ready', 'in_progress', 'in_review', 'needs_attention'];
// Every legal move. The engine rejects anything not listed. `cancel` and
// `reopen` sources are expanded programmatically so the matrix cannot drift.
const LEGAL = buildLegal();
function buildLegal() {
    const t = new Map();
    const allow = (from, ...to) => {
        const set = t.get(from) ?? new Set();
        to.forEach(s => set.add(s));
        t.set(from, set);
    };
    allow(null, 'draft'); //                            authoring
    allow('draft', 'waiting'); //                       approve (spec agent)
    allow('waiting', 'ready'); //                       readiness: met
    allow('waiting', 'needs_attention'); //             readiness: impossible
    allow('ready', 'in_progress'); //                   dispatch, or human Start
    allow('in_progress', 'in_review'); //               run reported done, or human Done
    allow('in_progress', 'needs_attention'); //         stop · dispatch failed · agent blocked · future watchdog timeout
    allow('in_review', 'completed'); //                 accept (Builder)
    // reopen — from any non-terminal, non-running source. `draft` has nothing to
    // reopen and `in_progress` is deferred (recovery from a running item is
    // stop/cancel, then reopen from needs_attention).
    ['waiting', 'ready', 'in_review', 'needs_attention'].forEach(s => allow(s, 'draft'));
    // rollback — completed -> draft. Distinct from reopen's four-state -> draft set:
    // reopen keeps history, rollback destructively restores Checkpoint 0. Do not
    // collapse into one allow() — canRollback (shared/statePolicy.ts) independently
    // gates which verb a caller may invoke; this table only says the PAIR is legal.
    allow('completed', 'draft');
    // cancel — any non-terminal. Terminals are absorbing.
    NON_TERMINAL.forEach(s => allow(s, 'cancelled'));
    return t;
}
// The side-effect map: each legal pair maps to an ORDERED list of effects.
// `evaluatePlan` rides the pairs where the item's settlement class or
// terminality changes, and is appended LAST in every list: the plan
// recomputation must observe whatever the earlier effects already did. On the
// parking pair the order is load-bearing — evaluateDependents runs FIRST, so a
// dependent it releases is already written unsettled by the time evaluatePlan
// recomputes, and the milestone cannot flip to in_review prematurely.
const EFFECTS = new Map([
    [key('draft', 'waiting'), ['evaluateReadiness']],
    [key('waiting', 'ready'), ['dispatch']],
    [key('in_progress', 'in_review'), ['evaluateDependents', 'evaluatePlan']],
    [key('in_review', 'completed'), ['evaluateDependents', 'evaluatePlan']],
    [key('in_review', 'draft'), ['evaluatePlan']],
    [key('completed', 'draft'), ['evaluatePlan']],
    ...NON_TERMINAL.map(s => [key(s, 'cancelled'), ['evaluateDependents', 'evaluatePlan']])
]);
const NO_EFFECTS = Object.freeze([]);
function key(from, to) {
    return `${from ?? '*'}→${to}`;
}
/** Is this exact move allowed? Anything not in the table is not. */
export function isLegal(from, to) {
    return LEGAL.get(from)?.has(to) ?? false;
}
/**
 * The ORDERED effects that follow this move — empty when it is a plain state
 * change (or an illegal pair, so a bad move cannot fire one).
 */
export function effectsFor(from, to) {
    if (!isLegal(from, to))
        return NO_EFFECTS;
    return EFFECTS.get(key(from, to)) ?? NO_EFFECTS;
}
