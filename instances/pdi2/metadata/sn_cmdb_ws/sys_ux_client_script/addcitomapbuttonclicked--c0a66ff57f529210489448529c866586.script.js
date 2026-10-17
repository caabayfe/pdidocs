function script({ api, event, helpers, imports }) {
	//addCiToMapButtonClicked  fired in mapSearchFilterController when add to map button is clicked in edit mode
	const { ALERT, addAlerts } = imports['sn_cmdb_ws.unifiedMapUtils']();

	var functions = {

		addCiToMapButtonClicked: function () {
			var addNodeId = api.state.addCiToMapSelectedRecord;
			if (this._nodeAlreadyPresent(addNodeId)) {
				this._addExistingNodeError(addNodeId);
				this._highlightExistingNode(addNodeId);
			}
			else {
				this._submitNewNodeMapRequest(addNodeId);
			}
		},

		_submitNewNodeMapRequest: function (nodeId) {
			api.setState("disableAddToMapButton", true);
			api.setState("connectButtonClicked", event.payload.isConnectClicked);
			api.data.getMapToFetchRelations.execute({
				"sysid": nodeId,
				"levels": 1,
				"configIdentifierId": api.context.props.configIdentifierId,
				"appId": api.context.app.appId
			});
		},

		_nodeAlreadyPresent: function (nodeId) {
			return api.state.nodes.some(n => n.id === nodeId);
		},

		_addExistingNodeError: function (nodeId) {
			addAlerts([{
				id: api.state.translations.CI_ALREADY_EXISTS,
				autoDismiss: true,
				status: ALERT.STATUS.CRITICAL,
				icon: ALERT.ICON.TRIANGLE_EXCLAMATION_OUTLINE,
				header: api.state.translations.DUPLICATE,
				content: api.state.translations.CI_ALREADY_EXISTS,
				action: { type: ALERT.TYPE.DISMISS }
			}], api, helpers);
		},

		_highlightExistingNode: function (nodeId) {
			var className = api.data.getMapDataController.ciData[nodeId].properties.sys_class_name.value;
			api.emit('SN_NODE_MAP_UNIFIED_CTRL#SELECT_ELEMENT', { "elementId": nodeId });
			api.emit('SN_UNIFIED_MAP_CTRL#UPDATE_PAGE_PROPS', {
				params: {
					selectedNodeSysid: nodeId,
					selectedConnectionId: "",
					selectedNodeClass: className
				}
			});
			api.setState("alignToNode", nodeId);
		}

	}
	functions.addCiToMapButtonClicked();
}
