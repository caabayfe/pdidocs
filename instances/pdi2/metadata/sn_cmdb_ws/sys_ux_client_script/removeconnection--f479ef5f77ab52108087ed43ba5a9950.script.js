function script({ api, event, helpers, imports }) {
	debugger;
	//removeConnection script in Map Search Filter UI Controller; handler for REMOVE_CONNECTION event issued from Remove connection modal dialog
	const { ALERT, cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();
	const { isEdgeEditable, findAllOrphanedNodes, setEditModeManageConnections } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();
	const { historyHideNode, historyDeleteEdge, historyHideEdge } = imports['sn_cmdb_ws.unifiedMapEditHistoryUtil']();

	const edgeToRemove = api.state.edgeToRemove;
	const ciData = api.data.getMapDataController.ciData;

	var hiddenNodeIds = api.state.filterOutput.hiddenNodes;
	var allNodes = cloneDeep(api.state.nodes);
	var allEdges = cloneDeep(api.state.edges);

	var allEmNodeIds;
	var allEmEdges;

	var nodeIdsToRemove = [];
	var edgeIdsToRemove = [];

	var updatedEdges;

	var functions = {

		removeConnection: function () {
			if (!isEdgeEditable(edgeToRemove.id)) {
				this.displayAlertForUnsupportedEdgeType();
				return;
			}
			this.defineEmNodesAndEdgeIds();
			this.hideTargetEdge();
			this.removeOrphanedNodesAndEdges();
			this.updateEditModeControls();
			this.updateEditModeHistory();
			this.setEdgeAndNodeState();
			this.removeConnectionFromCiData();
			this.clearValuesFromManageConnectionsPanel();
			this.displayNotification();
		},

		displayAlertForUnsupportedEdgeType: function () {
			var alerts = [{
				id: new Date().getTime(),
				status: ALERT.STATUS.WARNING,
				icon: ALERT.ICON.TRIANGLE_EXCLAMATION_OUTLINE,
				header: api.state.translations.UNSUPPORTED,
				content: api.state.translations.EDITING_VIRTUAL_AND_REFERENCE_CONNECTION_TYPES_NOT_SUPPORTED,
				action: { type: ALERT.TYPE.DISMISS }
			}];
			api.emit('SN_UNIFIED_MAP_CTRL#ADD_ALERTS', { alerts: alerts });

			//auto dismiss
			helpers.timing.setTimeout(() => {
				api.emit('SN_UNIFIED_MAP_CTRL#REMOVE_ALERTS', { alerts: alerts });
			}, 4000);
		},

		defineEmNodesAndEdgeIds: function () {
			allEmNodeIds = allNodes.filter(o => !hiddenNodeIds.includes(o.id)).map(o => o.id);
			allEmEdges = allEdges.filter(o => allEmNodeIds.includes(o.sourceId) && allEmNodeIds.includes(o.targetId));
		},

		hideTargetEdge: function () {
			edgeIdsToRemove.push(edgeToRemove.id);
			updatedEdges = allEmEdges.filter(e => e.id !== edgeToRemove.id);
		},

		removeOrphanedNodesAndEdges: function () {
			//first identify all nodes to hide
			var orphanedNodeIds = findAllOrphanedNodes(updatedEdges.map(o => o.id), allEmEdges, allEmNodeIds, api);
			nodeIdsToRemove.push(...orphanedNodeIds);
			//now identify all the edges to hide 
			this.findAndHideAllConnections(nodeIdsToRemove, edgeIdsToRemove, allEmNodeIds, ciData); //populates the list of nodes and edges to remove
		},

		findAndHideAllConnections: function (nodeIdsToHide, edgeIdsToHide, allEmNodeIds, ciData) {
			edgeIdsToHide.push(...allEmNodeIds.reduce((a, sysid) => {
				if (nodeIdsToHide.includes(sysid)) {
					//hide all connections if the current node is one being hidden
					a.push(...ciData[sysid].connections.map(o => o.id));
					return a;
				} else { //just hide connections that are tied to the hidden node
					a.push(...ciData[sysid].connections.reduce((acc, c) => nodeIdsToHide.includes(c.sourceId) || nodeIdsToHide.includes(c.targetId) ? [...acc, c.id] : acc, []));
					return a;
				}
			}, []));
		},

		updateEditModeControls: function () {
			//enable save
			var editModeToolbar = cloneDeep(api.state.editModeToolbar);
			editModeToolbar.saveDisabled = false;
			api.setState('editModeToolbar', editModeToolbar);
		},

		updateEditModeHistory: function () {
			var nodesToRemove = nodeIdsToRemove.map(idToRemove => ({ ...(allNodes.find(o => o.id === idToRemove)), editType: 'hide' }));
			var edgesToRemove = edgeIdsToRemove.filter(id => id !== edgeToRemove.id).map(idToRemove => ({ ...(allEdges.find(o => o.id === idToRemove)), editType: 'hide' }));
			
			nodesToRemove.forEach(histNode => {
				historyHideNode(api, histNode);
			});
			edgesToRemove.forEach(histEdge => {
				historyHideEdge(api, histEdge);
			});
			historyDeleteEdge(api, {...edgeToRemove, editType: 'delete'});
		},

		setEdgeAndNodeState: function () {
			var updatedNodes = allNodes.filter(o => !nodeIdsToRemove.includes(o.id));
			updatedEdges = allEmEdges.filter(o => !edgeIdsToRemove.includes(o.id));
			api.setState('nodes', updatedNodes);
			api.setState('edges', updatedEdges);
		},

		removeConnectionFromCiData: function () {
			// look for the connection using both the sourceCi and targetCi sysids
			var connections = ciData[edgeToRemove.targetId].connections.some(o => o.id === edgeToRemove.id) 
				? ciData[edgeToRemove.targetId].connections 
				: ciData[edgeToRemove.sourceId].connections;
			connections.splice(connections.findIndex(o => o.id === edgeToRemove.id), 1);
		},

		clearValuesFromManageConnectionsPanel: function () {
			setEditModeManageConnections({
				selectedSourceCi: '',
				selectedTargetCi: '',
				selectedRelType: '',
				buttonLabel: api.state.translations.CREATE_CONNECTION
			}, api, true);
			api.setState('editModeManageConnectionsIsDirty', false);
		},

		displayNotification: function () {
			var alerts = [{
				id: new Date().getTime(),
				status: ALERT.STATUS.POSITIVE,
				icon: ALERT.ICON.INFO_CIRCLE_OUTLINE,
				header: api.state.translations.CONNECTION_IS_NOW_HIDDEN,
				content: api.state.translations.THE_CONNECTION_WILL_BE_DELETED_WHEN_THE_MAP_IS_SAVED,
				action: { type: ALERT.TYPE.DISMISS }
			}];
			api.emit('SN_UNIFIED_MAP_CTRL#ADD_ALERTS', { alerts: alerts });
		
			//auto dismiss
			helpers.timing.setTimeout(() => {
				api.emit('SN_UNIFIED_MAP_CTRL#REMOVE_ALERTS', { alerts: alerts });
			}, 4000);
		}
	};
	
	functions.removeConnection();
}
