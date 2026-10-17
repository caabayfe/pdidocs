function script({ api, event, helpers, imports }) {
	//connectTo script in Map Search Filter UI Controller; handler for CONTEXT_MENU_ITEM_CLICKED event
	const { setEditModeManageConnections } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();

	var functions = {

		connectTo: function () {
			var node = event.payload.node;

			setEditModeManageConnections({
				selectedSourceCi: node.id,
				selectedTargetCi: "",
				selectedRelType: "",
				buttonLabel: api.state.translations.CREATE_CONNECTION
			}, api, true);
			api.setState('editModeManageConnectionsIsDirty', false);
		}
	};
	
	functions.connectTo();
}
