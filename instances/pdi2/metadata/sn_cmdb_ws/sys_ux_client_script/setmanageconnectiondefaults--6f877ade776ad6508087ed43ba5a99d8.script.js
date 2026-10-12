function script({ api, event, helpers, imports }) {
	//setManageConnectionDefaults script in Map Search Filter UI Controller; fired on page load if editMode input prop is true
	const { getConnections } = imports['sn_cmdb_ws.unifiedMapUtils']();
	const { setEditModeManageConnections } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();

	var functions = {

		setManageConnectionDefaults: function () {
			var selectedItemId = api.context.props.selectedItemId;
			var ciData = api.data.getMapDataController?.ciData;
			if (selectedItemId && ciData[selectedItemId]) {
				this._updateManageConnectionsState({
					sourceId: selectedItemId,
					targetId: null,
					relTypeId: null,
					buttonLabel: api.state.translations.CREATE_CONNECTION
				});
			} else if (selectedItemId) { //must be an edge
				var edge = getConnections(ciData).find(o => o.id === selectedItemId);
				this._updateManageConnectionsState({
					sourceId: edge.sourceId,
					targetId: edge.targetId,
					relTypeId: edge._label,
					buttonLabel: api.state.translations.CHANGE
				});
			}
		},

		_updateManageConnectionsState: function (obj) {
			setEditModeManageConnections(obj, api, true);
			api.setState('editModeManageConnectionsIsDirty', false);
		}
		
	};

	functions.setManageConnectionDefaults();
}
