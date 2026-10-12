/**
 * True iff this item should start a run now. `human` items are excluded here
 * and nowhere else — that single condition is why the engine never starts a
 * person's work.
 */
export function shouldDispatch(item) {
    return item.state === 'ready' && item.executor_type === 'agent' && item.rootState === 'in_progress' && item.owningPlanState === 'in_progress';
}
