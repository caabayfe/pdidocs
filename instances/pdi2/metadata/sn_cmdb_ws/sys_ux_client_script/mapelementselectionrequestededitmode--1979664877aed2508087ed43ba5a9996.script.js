function script({ api, event, helpers, imports }) {
	//mapElementSelectionRequestedEditMode script in Map Search Filter UI Controller; triggered from event ELEMENT_SELECTION_REQUESTED after user selects a node on the map
	const { setEditModeManageConnections, isEdgeEditable } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();

	var {node, edge, edges} = event.payload;
	var functions = {

		mapElementSelectionRequestedEditMode: function () {
			this.setSelectedItemsForManageConnectionsPanel();
		},

		setSelectedItemsForManageConnectionsPanel: function () {
			if (this.isSupportedNode()) {
				this.updateManageConnectionsState({
					selectedSourceCi: node.id,
					selectedTargetCi: null,
					selectedRelType: null,
					buttonLabel: api.state.translations.CREATE_CONNECTION,
				});
				api.setState("showMultipleEdgeErrorStateEditMode", false);
				api.setState("isSupportedEdgeForEditMode", true)
			} else if (edge) {
				if(isEdgeEditable(edge)) {
					this.updateManageConnectionsState({
						selectedSourceCi: edge.sourceId,
						selectedTargetCi: edge.targetId,
						selectedRelType: edge._label,
						buttonLabel: api.state.translations.CHANGE
					});
				} else {
					this.updateManageConnectionsState({
						selectedSourceCi: null,
						selectedTargetCi: null,
						selectedRelType: null,
						buttonLabel: api.state.translations.CHANGE
					});
				}
				api.setState("isSupportedEdgeForEditMode", isEdgeEditable(edge))
				api.setState("showMultipleEdgeErrorStateEditMode", false);
			} else if (edges) {
				api.setState("isSupportedEdgeForEditMode", true);
				api.setState("showMultipleEdgeErrorStateEditMode", true);
				//no-op currently
			} else { //background clicked or disabled node or group node
				this.updateManageConnectionsState({
					selectedSourceCi: null,
					selectedTargetCi: null,
					selectedRelType: null,
					buttonLabel: api.state.translations.CREATE_CONNECTION
				});
				api.setState("showMultipleEdgeErrorStateEditMode", false);
				api.setState("isSupportedEdgeForEditMode", true)
			}
		},

		isSupportedNode: function () {
			return node && !node.isGroup && !api.state.filterOutput.inactiveNodes.includes(node.id) && !api.state.filterOutput.hiddenNodes.includes(node.id);
		},

		updateManageConnectionsState: function (obj) {
			setEditModeManageConnections(obj, api, true);
			api.setState('editModeManageConnectionsIsDirty', false);
		}
	};
	functions.mapElementSelectionRequestedEditMode();
}   
