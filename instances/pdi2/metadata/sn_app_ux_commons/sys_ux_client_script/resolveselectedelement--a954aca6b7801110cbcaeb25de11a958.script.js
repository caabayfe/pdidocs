/**
 * A handler for SN_NODE_MAP_UNIFIED_CTRL#SELECT_ELEMENT.
 * This function resolves and updates the value of `selectedElementId` for the node-map.
 * If the requested elementId is an edge behind a merged edge, then id the merged edge will be resolved.
 * If the requested elementId is also in hiddenEdgeIds, then it won't be passed to the node-map.
 */
 function handler({api, event}) {
	const {node, edge, elementId} = event.payload;
	const requestedId = node?.id || edge?.id || elementId || '';

	const {outHiddenEdgeIds, edgesIndex = {}} = api.state.ctx || {};
	//filter-out if hidden edge
	const filteredId = outHiddenEdgeIds?.has(requestedId) ? '' : requestedId;
	const resolvedId = edgesIndex[filteredId]?.id || filteredId;

	api.setState('selectedElementId', resolvedId);

	//remember also the originally requested id for other flows to resolve
	api.setState('lastRequestedSelectionId', requestedId);
}
