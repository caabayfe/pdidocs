// Boundary rules over the induced SUB-PLAN graph: an item edge from sub-plan A
// into sub-plan B makes A wait on B's milestone. Only SUB-plan pairs induce
// edges: a root never participates (the item completing IS the release), and a
// same-plan edge induces nothing (readiness's same-boundary lane). A boundary
// loop can never resolve, so it is refused at edge creation.
import { findCycleThrough } from './readiness.ts';
/**
 * Build the induced sub-plan graph from the item-level edges in `graph`,
 * optionally including one CANDIDATE edge that does not exist yet (the
 * about-to-be-inserted dependency the loop check is guarding).
 */
export function subPlanEdges(graph, candidate) {
    const out = new Map();
    const add = (dependentItem, prerequisiteItem) => {
        const dependentPlan = graph.itemPlans.get(dependentItem) ?? '';
        const prerequisitePlan = graph.itemPlans.get(prerequisiteItem) ?? '';
        if (!dependentPlan || !prerequisitePlan || dependentPlan === prerequisitePlan)
            return;
        if ((graph.planParents.get(dependentPlan) ?? '') === '' || (graph.planParents.get(prerequisitePlan) ?? '') === '')
            return;
        const set = out.get(dependentPlan) ?? new Set();
        set.add(prerequisitePlan);
        out.set(dependentPlan, set);
    };
    for (const [dependent, prerequisites] of graph.prerequisites) {
        for (const prerequisite of prerequisites)
            add(dependent, prerequisite);
    }
    if (candidate)
        add(candidate.dependent, candidate.prerequisite);
    return out;
}
/** The sub-plan path proving `planId` waits on itself, or `null`. */
export function findBoundaryCycle(planId, edges) {
    if (!planId)
        return null;
    return findCycleThrough(planId, id => edges.get(id) ?? []);
}
/**
 * Would inserting the edge (dependent depends_on prerequisite) close a sub-plan
 * loop? Returns the plan-id cycle path, or `null` when the edge is safe. Called
 * BEFORE the insert, so the candidate edge is supplied explicitly.
 */
export function boundaryCycleWithEdge(graph, dependentItemId, prerequisiteItemId) {
    const dependentPlan = graph.itemPlans.get(dependentItemId) ?? '';
    if (!dependentPlan)
        return null;
    return findBoundaryCycle(dependentPlan, subPlanEdges(graph, { dependent: dependentItemId, prerequisite: prerequisiteItemId }));
}
/**
 * The prerequisite SUB-plans of `planId`'s members that are not yet completed —
 * empty means the sub-plan is eligible for activation. A cancelled prerequisite
 * plan is unmet here; its members surface as impossible through readiness.
 */
export function unmetPrerequisitePlans(planId, graph) {
    const out = new Set();
    for (const prerequisitePlan of subPlanEdges(graph).get(planId) ?? []) {
        if ((graph.planStates.get(prerequisitePlan) ?? 'standby') !== 'completed')
            out.add(prerequisitePlan);
    }
    return [...out];
}
