// src/server/domain/dependencies.ts
// The dependency-edge collaborator: edge reads/writes and the "are this item's
// prerequisites met" question. It reads work-item ROWS for state directly via the
// record seam and NEVER imports WorkItem — that one-way rule is what keeps
// domain/dependencies.ts ↔ domain/workItem.ts acyclic (WorkItem imports this; not
// the reverse). Cycles are accepted while authoring; workflow/readiness.ts
// classifies them as `impossible` before execution.
import * as records from '../glide/records.ts';
import { planStateOf, stateName } from '../shared/states.ts';
const EDGE_TABLE = 'sn_build_agent_work_item_dependency';
const PLAN_TABLE = 'sn_build_agent_plan';
const WI_TABLE = 'sn_build_agent_work_item';
function edgeRow(gr) {
    return {
        sys_id: gr.getUniqueValue(),
        work_item: String(gr.getValue('item') ?? ''),
        depends_on: String(gr.getValue('depends_on') ?? '')
    };
}
// Edges this item declares — the items it depends ON.
export function edgesOf(itemId) {
    const out = [];
    const gr = records.newRecord(EDGE_TABLE);
    gr.addQuery('item', itemId);
    gr.query();
    while (gr.next())
        out.push(edgeRow(gr));
    return out;
}
// Insert an edge; null when the write fails. No Business Rule aborts this table any
// more, so a null is a platform/db fault — emphatically not "a cycle was detected".
export function insertEdge(fields) {
    const gr = records.newRecord(EDGE_TABLE);
    gr.newRecord();
    gr.setValue('item', fields.item);
    gr.setValue('depends_on', fields.depends_on);
    const id = gr.insert();
    return id ? String(id) : null;
}
export function readEdge(sysId) {
    const gr = records.newRecord(EDGE_TABLE);
    return gr.get('sys_id', sysId) ? edgeRow(gr) : null;
}
export function deleteEdge(sysId) {
    const gr = records.newRecord(EDGE_TABLE);
    if (gr.get('sys_id', sysId))
        gr.deleteRecord();
}
function subtreePlanFrom(gr) {
    return {
        sys_id: String(gr.getUniqueValue()),
        parent_plan: String(gr.getValue('parent_plan') ?? ''),
        state: planStateOf(gr.getValue('state'), `plan ${gr.getUniqueValue()}`),
        number: String(gr.getValue('number') ?? ''),
        short_description: String(gr.getValue('short_description') ?? '')
    };
}
export function subtreePlans(planId) {
    if (!planId)
        return [];
    const plan = records.newRecord(PLAN_TABLE);
    if (!plan.get('sys_id', planId))
        return [];
    let root = subtreePlanFrom(plan);
    const ancestry = new Set([planId]);
    while (root.parent_plan && !ancestry.has(root.parent_plan)) {
        ancestry.add(root.parent_plan);
        const parent = records.newRecord(PLAN_TABLE);
        if (!parent.get('sys_id', root.parent_plan))
            break;
        root = subtreePlanFrom(parent);
    }
    const out = [root];
    const visited = new Set([root.sys_id]);
    const pending = [root.sys_id];
    while (pending.length) {
        const parentId = pending.shift();
        const children = records.newRecord(PLAN_TABLE);
        children.addQuery('parent_plan', parentId);
        children.query();
        while (children.next()) {
            const child = subtreePlanFrom(children);
            if (visited.has(child.sys_id))
                continue;
            visited.add(child.sys_id);
            out.push(child);
            pending.push(child.sys_id);
        }
    }
    return out;
}
/**
 * The subtree's plan ids only. Kept for the callers that never need the row
 * facts (the edge-insert scope guard, the delete cascade). One legacy quirk
 * preserved deliberately: a non-empty `planId` whose row is GONE still answers
 * `[planId]`, so a graph read racing a delete degrades to an empty single-plan
 * graph rather than an empty subtree.
 */
export function subtreePlanIds(planId) {
    const plans = subtreePlans(planId);
    if (plans.length)
        return plans.map(p => p.sys_id);
    return planId ? [planId] : [];
}
// The dependency slice readiness needs, as plain data: every item in the plan's SUBTREE
// (root + sub-plans) plus the edges among them, so the pure evaluator never touches the
// database.
//
// Subtree-scoped, not plan-scoped: dependency edges may cross sub-plan boundaries.
// That scope MUST agree here and at the insert
// guard together — an edge whose prerequisite sits in a sibling sub-plan would otherwise
// be absent from `states`, and readiness reads a missing prerequisite as `impossible`
// ("no longer exists") and halts a perfectly healthy item.
//
// The three BOUNDARY maps (item → direct plan, plan → parent/state) come off the
// cursors the subtree walk and item scan already run — no extra queries — and are
// what lets readiness apply the boundary matrix documented on `evaluate`.
export function graphFor(planId) {
    const prerequisites = new Map();
    const states = new Map();
    // Read off the SAME cursor as the states, so naming an item in a halt summary costs
    // no extra query. Presentation only — readiness never routes on it.
    const numbers = new Map();
    const itemPlans = new Map();
    const plans = subtreePlans(planId);
    const planParents = new Map(plans.map(p => [p.sys_id, p.parent_plan]));
    const planStates = new Map(plans.map(p => [p.sys_id, p.state]));
    const subtree = plans.length ? plans.map(p => p.sys_id) : [planId];
    const items = records.newRecord(WI_TABLE);
    if (subtree.length > 1)
        items.addQuery('plan', 'IN', subtree.join(','));
    else
        items.addQuery('plan', subtree[0] ?? planId);
    items.query();
    while (items.next()) {
        const id = String(items.getUniqueValue());
        states.set(id, stateName(Number(items.getValue('state'))));
        numbers.set(id, String(items.getValue('number') ?? ''));
        itemPlans.set(id, String(items.getValue('plan') ?? ''));
    }
    const edges = records.newRecord(EDGE_TABLE);
    edges.query();
    while (edges.next()) {
        const item = String(edges.getValue('item'));
        const dep = String(edges.getValue('depends_on'));
        if (!states.has(item))
            continue;
        prerequisites.set(item, [...(prerequisites.get(item) ?? []), dep]);
    }
    return { prerequisites, states, numbers, itemPlans, planParents, planStates };
}
// The items that depend ON this one — the reverse direction of edgesOf. Read as ids,
// not rows, because the only caller (the delete verb) needs to know WHO was waiting
// on an item BEFORE its edges are removed, so it can re-evaluate them after.
export function dependentIdsOf(itemId) {
    if (!itemId)
        return [];
    const out = [];
    const gr = records.newRecord(EDGE_TABLE);
    gr.addQuery('depends_on', itemId);
    gr.query();
    while (gr.next())
        out.push(String(gr.getValue('item') ?? ''));
    return out.filter(id => !!id);
}
// Every edge that TOUCHES this item, in EITHER direction — the ones it declares
// (`item`) and the ones that name it as a prerequisite (`depends_on`).
//
// Both directions is not optional. workflow/readiness.ts reads a prerequisite that
// no longer exists as `impossible` and halts the dependent item with a summary
// naming it, so an edge left pointing at a deleted work item does not just leak a
// row — it converts a delete into a silently halted sibling. Deleting the reverse
// edges is what releases those dependents to be re-evaluated normally.
//
// Two queries, not one OR: the two indexes on this table are separate
// (ix_dependency_item, ix_dependency_depends_on), so each half is an indexed read.
// The id set is deduped because a self-edge would otherwise be collected twice.
export function deleteEdgesTouching(itemId) {
    if (!itemId)
        return 0;
    const ids = new Set();
    for (const field of ['item', 'depends_on']) {
        const gr = records.newRecord(EDGE_TABLE);
        gr.addQuery(field, itemId);
        gr.query();
        while (gr.next())
            ids.add(String(gr.getUniqueValue()));
    }
    let deleted = 0;
    for (const id of ids) {
        const gr = records.newRecord(EDGE_TABLE);
        if (!gr.get(id))
            continue;
        if (!gr.deleteRecord())
            throw new Error(`dependency delete failed: ${id}`);
        deleted++;
    }
    return deleted;
}
