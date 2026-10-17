function script({ api, event, helpers, imports }) {
	//mapElementSelectionRequested script event in Map Search Filter UI Controller; fired after user selects a node on the map
	var params = {};
	var { node, edge, edges } = event.payload;

	var functions = {
		mapElementSelectionRequested: function () {
			this.updateSelectedItemProps();
			this.buildSelectedElementsList();
		},

		updateSelectedItemProps: function () {
			if (node && !api.state.filterOutput.inactiveNodes.includes(node.id) && !api.state.filterOutput.hiddenNodes.includes(node.id)) {
				// set (active) selected node; PM doesn't want disabled nodes to show any info in the right panel
				params.selectedNodeSysid = node.id;
				params.selectedNodeClass = api.data.getMapDataController.ciData[node.id].properties['sys_class_name'].value;
				params.selectedConnectionId = "";
			} else if (edge) {
				params.selectedNodeSysid = "";
				params.selectedNodeClass = "";
				params.selectedConnectionId = edge.id || (edge.sourceId + '-' + edge.targetId); //the fake edges introduced by the COE controller do not have any id's
			} else if (edges) {
				params.selectedNodeSysid = "";
				params.selectedNodeClass = "";
				params.selectedConnectionId = edges.map(e => e.id).join('_');
			} else { //background clicked or disabled node
				params.selectedNodeSysid = "";
				params.selectedConnectionId = "";
				params.selectedNodeClass = "";
			}

			api.emit('SN_UNIFIED_MAP_CTRL#UPDATE_PAGE_PROPS', { params: params });
		},

		buildSelectedElementsList: function () {
			var selectedElements = [];
			if (params.selectedNodeSysid) {
				selectedElements.push(selectedNodeSysid);
			}
			api.setState('selectedElements', selectedElements);
		}
	};
	functions.mapElementSelectionRequested();
}
