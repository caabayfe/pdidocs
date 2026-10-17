// The drain loop — this is the whole cascade: one loop, one stack frame, no
// recursion into the platform. The re-read is the load-bearing line:
// `if (current.state !== t.to) continue` makes double-invocation safe, so the
// engine and a business rule can both call in without coordinating — and no
// suppression mechanism (setWorkflow(false) and friends) is needed anywhere.
// The drain carries work-item transitions only; plan consequences execute
// inline in recomputePlanChain (engine/planRollup.ts).
import { effectsFor } from './transitions.ts';
/**
 * Run a cascade to completion.
 *
 * Returns nothing, on purpose. No verb reports a cascade result: nothing
 * consumed one (the client's `runVerb` discards the response body), and a child
 * that fails to start halts itself to `needs_attention`, which is where the
 * Builder looks.
 *
 * Ordering is FIFO. Items promoted together are siblings and independent, so
 * order carries no meaning — FIFO simply makes tests deterministic.
 */
export function drain(queue, effects) {
    // Defensive copy: callers pass their own array, and mutating it would be a
    // surprising side effect of "run this cascade".
    const pending = [...queue];
    while (pending.length > 0) {
        const t = pending.shift();
        const enqueue = (next) => pending.push(next);
        // Reconcile against the present, not against what we observed. A
        // superseded transition — the item has since moved on, or been deleted —
        // is a no-op rather than an error: a duplicate signal is harmless and a
        // missed one is recoverable, because the next trigger sees the same fact.
        const item = effects.loadWorkItem(t.id);
        if (item === null || item.state !== t.to)
            continue;
        applyInOrder(t, effectsFor(t.from, t.to), item, effects, enqueue);
    }
}
// One transition's effect list, run IN ORDER.
//
// The FIRST effect acts on exactly the record the guard above approved — it is
// handed on rather than re-fetched, so no second read can widen the window the
// guard just closed. Every LATER effect re-reads fresh state, because an earlier
// effect may have mutated the very record it is about to act on (dispatch's
// failure path, for example, halts the item). The transition's guard is then
// re-applied to the fresh read: if the record has moved off the transition's
// landing state (or was deleted), the remaining effects are SKIPPED — the same
// superseded-transition semantics the top of the loop applies.
function applyInOrder(t, list, first, effects, enqueue) {
    let item = first;
    for (let i = 0; i < list.length; i++) {
        if (i > 0) {
            const fresh = effects.loadWorkItem(t.id);
            if (fresh === null || fresh.state !== t.to)
                return;
            item = fresh;
        }
        effects.applyWorkItem(list[i], item, enqueue, t);
    }
}
