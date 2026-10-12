function script({ api, event, helpers, imports }) {
	//nodesChanged script in Map Search Filter UI Controller; triggered by nodes changed scriplet
	const { cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();
	const { isEdgeEditable, getEdgePropsToAlterForEditMode } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();
	
	var editModeManageConnections = cloneDeep(api.state.editModeManageConnections)

	var functions = {

		nodesChanged: function() {
			this.updateItemsInCiDropdowns();
			this.disableReferencesAndVirtualEdges();
			this.saveEditModeManageConnectionState();
		},

		updateItemsInCiDropdowns: function () {
			var filterData = api.state.filterOutput;
			var ciDropdownInput = api.state.nodes
			.filter(n => !filterData.hiddenNodes.includes(n.id))
			.sort((a, b) => {
				var aLabel = a.viewData.primaryLabel?.toLowerCase() || '';
				var bLabel = b.viewData.primaryLabel?.toLowerCase() || '';
				return aLabel.localeCompare(bLabel);
			}).map((o) => {
				return {
					id: o.id,
					label: o.viewData.primaryLabel,
					sublabel: o.viewData.secondaryLabel
				};
			});
	
			editModeManageConnections.nodes = ciDropdownInput;
		},

		disableReferencesAndVirtualEdges: function() {
			var edges = cloneDeep(api.state.edges);
			var propsToManage = getEdgePropsToAlterForEditMode(api);
			edges.forEach((edge) => {
				if (!isEdgeEditable(edge)) {
					this._addEdgeProps(edge, propsToManage);
				}
			});
			api.setState('edges', edges);
		},

		_addEdgeProps: function(edge, propsToManage) {
			propsToManage.forEach((prop) => {
				edge[prop.name] = prop.value;
			});
		},

		saveEditModeManageConnectionState: function () {
			api.setState('editModeManageConnections', editModeManageConnections);
		}

	};
	functions.nodesChanged();
}
