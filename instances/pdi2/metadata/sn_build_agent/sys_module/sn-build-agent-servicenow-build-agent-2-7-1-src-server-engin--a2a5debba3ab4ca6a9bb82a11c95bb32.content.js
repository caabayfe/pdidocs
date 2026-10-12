// src/server/engine/dependencies.ts
// Dependency-edge verbs: read, add, remove. Thin barrel wrappers over the
// domain/dependencies collaborator (edge I/O) and the WorkItem entity (item reads +
// draft guard). Edges are editable only while the dependent item is draft;
// structural rules (self-edge, cross-plan, duplicate, existence) are validated here.
//
// Cycles are NOT rejected here. They are found by workflow/readiness.ts, which
// answers `impossible` for an item whose prerequisites form a loop and halts it
// with a summary naming the loop. A failed insert remains a storage error rather
// than being misclassified as a cycle.
import { WorkItem } from '../domain/workItem.ts';
import * as deps from '../domain/dependencies.ts';
import { boundaryCycleWithEdge } from '../workflow/boundaries.ts';
import { WorkItemNotFoundError, DependencyNotFoundError, InvalidStateError, ValidationError } from '../shared/errors.ts';
const toDto = (r) => ({
    sys_id: r.sys_id,
    work_item: WorkItem.load(r.work_item).reference,
    depends_on: WorkItem.load(r.depends_on).reference
});
// 404 before any other work (matches the pre-entity requireItem order).
function requireItem(id) {
    const wi = id ? WorkItem.tryLoad(id) : null;
    if (!wi)
        throw new WorkItemNotFoundError(id ?? '');
    return wi;
}
export function getDependencies(itemId) {
    requireItem(itemId);
    return deps.edgesOf(itemId).map(toDto);
}
export function addDependency(itemId, dependsOn) {
    const item = requireItem(itemId);
    // Edits allowed only while the dependent item is draft — 409 before other checks.
    if (item.state !== 'draft')
        throw new InvalidStateError('dependencies are editable only while the item is draft', item.state);
    if (!dependsOn)
        throw new ValidationError('depends_on is required');
    const target = WorkItem.resolve(dependsOn);
    const dependsOnId = target.sys_id;
    if (dependsOnId === itemId)
        throw new ValidationError('a work item cannot depend on itself');
    // Same subtree, not necessarily the same sub-plan. The authoring agent decomposes a
    // plan into sub-plans, so refusing cross-sub-plan edges meant a decomposed plan could
    // not express its own ordering. Edges across unrelated ROOTS are still refused: two
    // roots are two independent runs, and readiness only ever loads one subtree.
    //
    // Must stay in step with `graphFor`, which loads the same subtree — an edge legal here
    // but invisible there would halt the dependent as `impossible`.
    if (!deps.subtreePlanIds(item.plan_sys_id).includes(target.plan_sys_id)) {
        throw new ValidationError('dependency edges may not cross plans — the prerequisite must be in the same plan or one of its sub-plans');
    }
    if (deps.edgesOf(itemId).some(d => d.depends_on === dependsOnId))
        throw new ValidationError('dependency already exists');
    // Boundary loop detection: an edge whose ends live in two different SUB-plans
    // makes the dependent's sub-plan wait on the prerequisite's milestone. If that
    // induced wait closes a loop — two sub-plans each waiting on the other's
    // acceptance — no review can ever release either side, so the edge is refused
    // NOW, naming the sub-plans, rather than discovered later as a permanent
    // stall. Item-LEVEL cycles are deliberately still not rejected here (see the
    // header): readiness answers those, and an item cycle is repairable by
    // removing an edge while draft — a boundary loop is not visible to readiness
    // at all. Same-plan edges cannot induce anything, so the graph read is
    // skipped for them.
    if (item.plan_sys_id !== target.plan_sys_id) {
        const cycle = boundaryCycleWithEdge(deps.graphFor(item.plan_sys_id), itemId, dependsOnId);
        if (cycle) {
            const names = new Map(deps.subtreePlans(item.plan_sys_id).map(p => [p.sys_id, p.number || p.short_description || p.sys_id]));
            throw new ValidationError(`this dependency would make sub-plans wait on each other's milestones: ${cycle.map(id => names.get(id) ?? id).join(' → ')}`);
        }
    }
    const id = deps.insertEdge({ item: itemId, depends_on: dependsOnId });
    // A falsy insert is a platform/db fault — the edge table has no aborting BR any
    // more (mirrors Plan.create) → generic Error → 500 internal_error, not a
    // client-facing 400. It is emphatically NOT "we detected a cycle": cycles are
    // readiness's answer, and reporting one here would name the wrong cause.
    if (!id)
        throw new Error('dependency edge insert failed');
    return toDto(deps.readEdge(id));
}
export function removeDependency(itemId, edgeId) {
    const item = requireItem(itemId);
    if (item.state !== 'draft')
        throw new InvalidStateError('dependencies are editable only while the item is draft', item.state);
    const edge = edgeId ? deps.readEdge(edgeId) : null;
    if (!edge || edge.work_item !== itemId)
        throw new DependencyNotFoundError(edgeId ?? '');
    deps.deleteEdge(edgeId);
}
