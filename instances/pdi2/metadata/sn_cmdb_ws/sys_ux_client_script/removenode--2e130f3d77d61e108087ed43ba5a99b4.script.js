function script({ api, event, helpers, imports }) {
	//removeNode script in Map Search Filter UI Controller; handler for CONTEXT_MENU_ITEM_CLICKED event
	const { ALERT, addAlerts, cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();
	const { findAllOrphanedNodes, setEditModeManageConnections } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();
	const { historyForgetNode, historyDeleteEdge } = imports['sn_cmdb_ws.unifiedMapEditHistoryUtil']();

	const nodeToRemove = api.state.nodeToRemove;
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

		removeNode: function () {
			if (nodeToRemove.id === api.state.rootNode) {
				this.displayAlertForCannotHideHomeNode();
				return;
			}
			this.defineEmNodesAndEdgeIds();
			this.hideEdgesOnTargetNode();
			this.hideTargetNode();
			this.removeOrphanedNodesAndEdges();
			this.updateEditModeControls();
			this.updateEditModeHistory();
			this.setEdgeAndNodeState();
			this.clearValuesFromManageConnectionsPanel();
			this.displayNotification();
		},

		displayAlertForCannotHideHomeNode: function () {
			var alerts = [{
				id: new Date().getTime(),
				status: ALERT.STATUS.WARNING,
				icon: ALERT.ICON.TRIANGLE_EXCLAMATION_OUTLINE,
				header: api.state.translations.NOT_ALLOWED,
				content: api.state.translations.CANNOT_HIDE_HOME_NODE,
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

		hideEdgesOnTargetNode: function () {
			updatedEdges = allEmEdges.filter(e => {
				if (e.sourceId === nodeToRemove.id || e.targetId === nodeToRemove.id) {
					edgeIdsToRemove.push(e.id);
					return false;
				} else {
					return true;
				}
			});
		},

		hideTargetNode: function () {
			nodeIdsToRemove.push(nodeToRemove.id);
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
			// This is a special history case, specific to removing an unsaved added node
			// Shows as a Hide in history, but removes the node and all associated edges from lastest
			// history entry, effectively cancelling all associated changes.
			historyForgetNode(api, nodeToRemove);
		},

		setEdgeAndNodeState: function () {
			var updatedNodes = allNodes.filter(o => !nodeIdsToRemove.includes(o.id));
			updatedEdges = allEmEdges.filter(o => !edgeIdsToRemove.includes(o.id));
			api.setState('nodes', updatedNodes);
			api.setState('edges', updatedEdges);
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
			var ciLabel = nodeToRemove.viewData.primaryLabel;
			if (ciLabel) {
				helpers.translate('"{0}" removed.', ciLabel)
					.then((translatedText) => {
						this.createRemoveAlertWithHeader(translatedText);
					});
			}
			else {
				this.createRemoveAlertWithHeader(api.state.translations.CI_REMOVED);
			}
		},

		createRemoveAlertWithHeader: function (header) {
			addAlerts([{
				id: new Date().getTime(),
				autoDismiss: true,
				status: ALERT.STATUS.POSITIVE,
				icon: ALERT.ICON.INFO_CIRCLE_OUTLINE,
				header: header,
				content: api.state.translations.SELECT_SAVE_TO_APPLY_CHANGES_AND_UPDATE_THE_MAP,
				action: { type: ALERT.TYPE.DISMISS }
			}], api, helpers);
		}
	};

	functions.removeNode();
}
