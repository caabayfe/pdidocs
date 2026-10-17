function script({ api, event, helpers, imports }) {
	//editModeManageConnectionsChanged script in Map Search Filter UI Controller; triggered by editModeManageConnections changed scriplet
	const { cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();
	const { buildEditModeConnectionList } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();
	
	var functions = {

		editModeManageConnectionsChanged: function() {
			this._manageConnectionsPanelIsDirty();
			this._managedConnectionPanelRelState();
		},

		_manageConnectionsPanelIsDirty: function() {
			var obj = cloneDeep(api.state.editModeManageConnections);
			var propsToCompare = {
				selectedSourceCi: obj.selectedSourceCi,
				selectedTargetCi: obj.selectedTargetCi,
				selectedRelType: obj.selectedRelType
			};
			var isDirty = JSON.stringify(propsToCompare) !== api.state.editModeManageConnectionsSnapshot;
			api.setState('editModeManageConnectionsIsDirty', isDirty);
		},
		_managedConnectionPanelRelState: function() {
			var manageConnObj = api.state.editModeManageConnections;
			var disable = !manageConnObj.selectedSourceCi || !manageConnObj.selectedTargetCi;
			api.setState('disableEditConnectionRelTypes', disable);
			var showSuggestedRels = !!api.state.showSuggestedRels;
			var dropdownItems = buildEditModeConnectionList(api, showSuggestedRels);
			api.setState('editModeConnectionTypeDropdownItems', dropdownItems);
		}

	};
	functions.editModeManageConnectionsChanged();
}
