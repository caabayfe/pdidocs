/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const items = api.state.contentTreeItems || [];
    api.data.get_mid_related_records_count.refresh();
  const rawMap = api.data.get_mid_related_records_count?.output || {};


  // Normalize `{ id: number | "number" | {count:number|string} }` -> `{ id: number }`
  const countsById = Object.fromEntries(
    Object.entries(rawMap).map(([id, v]) => {
      const n = (typeof v === 'number')
        ? v
        : (typeof v === 'string')
          ? Number(v)
          : Number(v?.count ?? 0);
      return [id, (Number.isFinite(n) ? n : 0)];
    })
  );

  let changed = false;

  const updateNode = (node) => {
    if (!node) return node;

    const id = node.id;
    const next = countsById[id];

    // Prepare current label (can be number or string)
    const hvp = Array.isArray(node.highlightedValueProps) ? node.highlightedValueProps : [];
    const hvp0 = hvp[0] || {};
    const curr = hvp0.label;
    const currNum = (typeof curr === 'number') ? curr : Number(curr);

    // Only update if next is a finite number and it differs
    if (Number.isFinite(next) && currNum !== next) {
      changed = true;
      return {
        ...node,
        highlightedValueProps: [{ ...hvp0, label: next }]
      };
    }

    return node;
  };

  const newItems = items.map(item => {
    // update top-level node (if applicable)
    let topUpdated = updateNode(item);

    // update one-level children immutably
    if (Array.isArray(item.children) && item.children.length) {
      let anyChildChanged = false;
      const newChildren = item.children.map(child => {
        const updated = updateNode(child);
        if (updated !== child) anyChildChanged = true;
        return updated;
      });
      if (anyChildChanged) {
        topUpdated = { ...topUpdated, children: newChildren };
      }
    }

    return topUpdated;
  });

  if (changed) {
    api.setState('contentTreeItems', newItems);  // new reference → triggers re-render
  }
}
