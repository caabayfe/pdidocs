import { label } from '../shared/label.ts';
function name(id, graph) {
    return label({ sys_id: id, number: graph.numbers?.get(id) });
}
const MET = { answer: 'met' };
const PENDING = { answer: 'pending' };
/**
 * Find a cycle that returns to `start`, following each node's outgoing edges.
 * Only cycles THROUGH `start` count — a node downstream of someone else's loop
 * is waiting, not looping. The visited set bounds the walk on any graph.
 */
export function findCycleThrough(start, nextFor) {
    const path = [start];
    const visited = new Set([start]);
    const walk = (node) => {
        for (const next of nextFor(node)) {
            if (next === start)
                return [...path, start];
            if (visited.has(next))
                continue;
            visited.add(next);
            path.push(next);
            const found = walk(next);
            if (found)
                return found;
            path.pop();
        }
        return null;
    };
    return walk(start);
}
/**
 * Evaluate one item. Prerequisite satisfaction is BOUNDARY-KEYED — a boundary
 * is an item's DIRECT plan. Per prerequisite:
 *   a. missing or cancelled prerequisite item → impossible;
 *   b. same boundary → satisfied at in_review OR completed (a parked
 *      prerequisite is good to build on);
 *   c. cross-boundary, owned by a SUB-plan → prerequisite item completed AND
 *      its sub-plan completed;
 *   d. cross-boundary, owned by a ROOT → item completed alone;
 *   e. cross-boundary, prerequisite's plan cancelled → impossible.
 */
export function evaluate(itemId, graph) {
    const cycle = findCycleThrough(itemId, id => graph.prerequisites.get(id) ?? []);
    if (cycle) {
        return {
            answer: 'impossible',
            summary: `This item's dependencies form a loop: ${cycle.map(id => name(id, graph)).join(' → ')}.`
        };
    }
    const prerequisites = graph.prerequisites.get(itemId) ?? [];
    let pending = false;
    for (const id of prerequisites) {
        const answer = prerequisiteReadiness(itemId, id, graph);
        if (answer.answer === 'impossible')
            return answer;
        if (answer.answer === 'pending')
            pending = true;
    }
    return pending ? PENDING : MET;
}
// One prerequisite's verdict, per the matrix on evaluate().
function prerequisiteReadiness(itemId, prereqId, graph) {
    const state = graph.states.get(prereqId);
    if (state === undefined) {
        return { answer: 'impossible', summary: `A prerequisite of this item no longer exists (${name(prereqId, graph)}).` };
    }
    if (state === 'cancelled') {
        return { answer: 'impossible', summary: `A prerequisite of this item was cancelled (${name(prereqId, graph)}), so it can never start.` };
    }
    const dependentPlan = graph.itemPlans.get(itemId) ?? '';
    const prerequisitePlan = graph.itemPlans.get(prereqId) ?? '';
    if (dependentPlan && dependentPlan === prerequisitePlan) {
        return state === 'in_review' || state === 'completed' ? MET : PENDING;
    }
    const prerequisitePlanState = graph.planStates.get(prerequisitePlan) ?? 'standby';
    if (prerequisitePlanState === 'cancelled') {
        return {
            answer: 'impossible',
            summary: `A prerequisite of this item (${name(prereqId, graph)}) belongs to a cancelled sub-plan, so it can never be released.`
        };
    }
    const ownedBySubPlan = (graph.planParents.get(prerequisitePlan) ?? '') !== '';
    if (ownedBySubPlan)
        return state === 'completed' && prerequisitePlanState === 'completed' ? MET : PENDING;
    return state === 'completed' ? MET : PENDING;
}
