function script({ api, event, helpers, imports }) {
	//selectedItemIdChanged fired in mapSearchFilterController when an connectionId is changed
	const { setEditModeManageConnections } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();

	var edge = api.state.edges.find(o => o.id === event.payload.connectionId);
	setEditModeManageConnections({
		selectedSourceCi: edge.sourceId,
		selectedTargetCi: edge.targetId,
		selectedRelType: edge._label,
		buttonLabel: api.state.translations.CHANGE
	}, api, true);

	if(edge?.id) {
		api.emit('SN_NODE_MAP_UNIFIED_CTRL#SELECT_ELEMENT', { "elementId": edge.id });
		api.emit('SN_UNIFIED_MAP_CTRL#UPDATE_PAGE_PROPS', { params: {
			selectedNodeSysid: "",
			selectedConnectionId: edge.id,
			selectedNodeClass: ""
		}});
	}
	api.setState('editModeManageConnectionsIsDirty', false);
	api.setState("showMultipleEdgeErrorStateEditMode", false);
}
