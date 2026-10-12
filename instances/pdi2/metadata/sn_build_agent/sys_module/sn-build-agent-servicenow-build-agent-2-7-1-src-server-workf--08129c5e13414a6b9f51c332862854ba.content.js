export function computeRollbackOrder(rootId, graph, maxDepth) {
    // Invert graph.prerequisites: dependentsOf[x] = every item whose
    // prerequisites include x (i.e. every item that depends_on x).
    const dependentsOf = new Map();
    for (const [item, prereqs] of graph.prerequisites) {
        for (const prereq of prereqs) {
            const list = dependentsOf.get(prereq) ?? [];
            list.push(item);
            dependentsOf.set(prereq, list);
        }
    }
    const dependentsOfId = (id) => dependentsOf.get(id) ?? [];
    // BFS the blast radius outward from rootId through the reverse edges,
    // depth-capped. depthExceeded is true iff a dependent existed beyond
    // maxDepth that is NOT already captured within the cap (at any depth up
    // to maxDepth, not necessarily a shorter one — a diamond can capture a
    // dependent at the SAME depth via a different path) — checked per-id,
    // not per-frontier-item, so a diamond shape never false-positives.
    const depthById = new Map([[rootId, 0]]);
    let frontier = [rootId];
    let depth = 0;
    let depthExceeded = false;
    while (frontier.length > 0) {
        if (depth >= maxDepth) {
            for (const id of frontier) {
                for (const dependentId of dependentsOfId(id)) {
                    if (!depthById.has(dependentId))
                        depthExceeded = true;
                }
            }
            break;
        }
        const nextFrontier = [];
        for (const id of frontier) {
            for (const dependentId of dependentsOfId(id)) {
                if (depthById.has(dependentId))
                    continue;
                depthById.set(dependentId, depth + 1);
                nextFrontier.push(dependentId);
            }
        }
        frontier = nextFrontier;
        depth++;
    }
    const blastRadius = new Set(depthById.keys());
    // Kahn's algorithm over the blast-radius subgraph: an item is ready to
    // restore once every one of its dependents WITHIN the blast radius has
    // already been ordered (a dependent excluded by the depth cap does not
    // block its prerequisite from ordering).
    const remainingDependentCount = new Map();
    for (const id of blastRadius) {
        remainingDependentCount.set(id, dependentsOfId(id).filter(d => blastRadius.has(d)).length);
    }
    const order = [];
    const queue = [...blastRadius].filter(id => remainingDependentCount.get(id) === 0);
    while (queue.length > 0) {
        const id = queue.shift();
        order.push(id);
        for (const prereq of graph.prerequisites.get(id) ?? []) {
            if (!blastRadius.has(prereq))
                continue;
            const next = (remainingDependentCount.get(prereq) ?? 0) - 1;
            remainingDependentCount.set(prereq, next);
            if (next === 0)
                queue.push(prereq);
        }
    }
    const orderedSet = new Set(order);
    const incomplete = [...blastRadius].filter(id => !orderedSet.has(id));
    return { order, depthById, depthExceeded, incomplete };
}
