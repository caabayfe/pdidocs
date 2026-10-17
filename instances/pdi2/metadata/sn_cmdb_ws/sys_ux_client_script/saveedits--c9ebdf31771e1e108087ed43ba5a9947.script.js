function script({ api, event, helpers, imports }) {
	//saveEdits script in Map Search Filter UI Controller; handler for SN_UNIFIED_MAP_CTRL#SAVE_EDITS event
	const { cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();
	const { findAllOrphanedNodes } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();

	var functions = {

		saveEdits: function () {
			var skipPrompt = !!event.payload.skipPrompt;
			if (!skipPrompt && this.mapHasIslands()) {
				helpers.modal.open("[component-id$='save_islands_confirmation']");
				return;
			}
			var editModeToolbar = cloneDeep(api.state.editModeToolbar);
			editModeToolbar.saveDisabled = true;
			api.setState('editModeToolbar', editModeToolbar);

			var editModeHistory = api.state.editModeHistory;
			// This logic must be updated once jump-to-edit functionality is added.
			var editModeHistoryEntry = editModeHistory[editModeHistory.length - 1];
			api.data.saveUserEdits.execute({
				"editHistoryEntry": editModeHistoryEntry
			});
		},
		mapHasIslands: function () {
			var { nodes, edges } = this.getEmNodesAndEdgeIds();
			var orphanedNodes = findAllOrphanedNodes(edges.map(o => o.id), edges, nodes, api);
			return !!orphanedNodes?.length;
		},
		getEmNodesAndEdgeIds: function () {
			var allNodes = cloneDeep(api.state.nodes);
			var allEdges = cloneDeep(api.state.edges);
			var hiddenNodeIds = api.state.filterOutput.hiddenNodes;
			var allEmNodeIds = allNodes.filter(o => !hiddenNodeIds.includes(o.id)).map(o => o.id);
			var allEmEdges = allEdges.filter(o => allEmNodeIds.includes(o.sourceId) && allEmNodeIds.includes(o.targetId));
			return {
				nodes: allEmNodeIds,
				edges: allEmEdges
			};
		},
	};
	functions.saveEdits();
}	
