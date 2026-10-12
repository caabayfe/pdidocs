import { classifyState } from '../shared/states.ts';
import { label } from '../shared/label.ts';
function name(id, graph) {
    return label({ sys_id: id, number: graph.numbers?.get(id) });
}
/**
 * The refusal message for accepting `itemId` now, or `null` when its whole
 * foundation is completed. Breadth-first over the prerequisite closure with a
 * visited set; the FIRST blocker found is named — one is enough to refuse.
 */
export function foundationBlocker(itemId, graph) {
    const visited = new Set([itemId]);
    const pending = [...(graph.prerequisites.get(itemId) ?? [])];
    while (pending.length) {
        const id = pending.shift();
        if (visited.has(id))
            continue;
        visited.add(id);
        const state = graph.states.get(id);
        if (state === 'completed') {
            pending.push(...(graph.prerequisites.get(id) ?? []));
            continue;
        }
        if (classifyState(state) === 'cancelled') {
            return `prerequisite ${name(id, graph)} was cancelled — remove the dependency, rework ${name(id, graph)}, or cancel this item`;
        }
        if (state === 'in_review') {
            return `prerequisite ${name(id, graph)} is parked awaiting review (a revocable pass) — accept ${name(id, graph)} first`;
        }
        return `prerequisite ${name(id, graph)} is still ${state} — it must be completed before this item can be accepted`;
    }
    return null;
}
/**
 * Dependency (topological) order for a bulk-accept selection: prerequisites
 * before their dependents, so accepting a chain in one submission lets the
 * guard lift itself item by item. Only edges WITHIN the selection order
 * anything — an out-of-selection prerequisite is the guard's business.
 */
export function acceptanceOrder(ids, graph) {
    const selected = new Set(ids);
    const ordered = [];
    const placed = new Set();
    const place = (id) => {
        if (placed.has(id))
            return;
        placed.add(id);
        for (const p of graph.prerequisites.get(id) ?? [])
            if (selected.has(p))
                place(p);
        ordered.push(id);
    };
    for (const id of ids)
        place(id);
    return ordered;
}
