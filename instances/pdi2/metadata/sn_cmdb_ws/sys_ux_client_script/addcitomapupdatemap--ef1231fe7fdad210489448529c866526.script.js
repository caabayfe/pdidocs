function script({ api, event, helpers, imports }) {
	//addCiToMapUpdateMap script in Map Search Filter UI Controller; fired in mapSearchFilterController after successful fetch of the getMap call is finished with 1 level.
	//Process the returned data and update the node and edge object to update the map view
	const { getConnections, cloneDeep, ALERT, addAlerts } = imports['sn_cmdb_ws.unifiedMapUtils']();
	const { setEditModeManageConnections } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();
	const { historyShowNode } = imports['sn_cmdb_ws.unifiedMapEditHistoryUtil']();

	let mapData = event.payload.data?.output?.rawData;

	if (!mapData || event.payload.data?.output?.error?.length) { //Failed to fetch data 
		return;
	}

	let ciData = {};
	let isConnectButtonClicked = api.state.connectButtonClicked;
	let selectedSysId = api.state.addCiToMapSelectedRecord;
	var functions = {

		addCiToMapUpdateMap: function () {
			let isEndpoint  = mapData?.sysClassPath?.startsWith('/!!/!$');
			if(isEndpoint) {
				this.showEndpointAlert();
			} else {
				this.processRawData();
				this.setCiAsSelectedNode();
				this.alignAndShowAlerts();
				this.updateManageConnectionPanelAndPageProps();
			}
		},

		showEndpointAlert: function(){
			this._resetStates();
			addAlerts([{
				id: ADD_CI_TO_MAP,
				status: ALERT.STATUS.CRITICAL,
				icon: ALERT.ICON.TRIANGLE_EXCLAMATION_OUTLINE,
				content: api.state.translations.THE_MAP_EDITOR_DOES_NOT_SUPPORT_ADDING_ENDPOINT_CIS,
				action: { type: ALERT.TYPE.DISMISS },
				autoDismiss: true
			}], api, helpers);
		},
		
		processRawData: function () {
			//Build the ciData object 
			Object.keys(mapData.ciNodeInfo).forEach((sysid) => {
				ciData[sysid] = { ...mapData.ciNodeInfo[sysid] };
				//add style and direction to the connections (required for map)
				ciData[sysid].connections.forEach((c) => {
					c.style = c.isReference ? 'dashed' : 'solid';
					c.direction = c.isReference ? 'none' : 'original';
				});
			});
			let newNode = this._addNode(ciData);
			let newEdges = getConnections(ciData);
			let nodes = cloneDeep(api.state.nodes)

			//Add any edges to the map which already exist for the selected node
			let edges = cloneDeep(api.state.edges);
			const relevantEdges = newEdges.filter(edge =>
				nodes.some(node => (node.id === edge.sourceId && selectedSysId === edge.targetId) || (node.id === edge.targetId && selectedSysId === edge.sourceId)
				));
			nodes.push(newNode);
			if (relevantEdges?.length) {
				edges.push(...relevantEdges);
				api.setState("edges", edges);
			}
			this._addHistory(newNode, relevantEdges)
			//Add the new node
			api.setState("nodes", nodes);
			api.setState("addCiToMapSelectedRecord", "");
			let originalCiData = api.data.getMapDataController.ciData;
			originalCiData[selectedSysId] = ciData[selectedSysId];
			api.setState("ciData", originalCiData);
		},

		setCiAsSelectedNode: function () {
			api.emit('SN_NODE_MAP_UNIFIED_CTRL#SELECT_ELEMENT', { "elementId": selectedSysId });
			api.emit('SN_UNIFIED_MAP_CTRL#UPDATE_PAGE_PROPS', {
				params: {
					selectedNodeSysid: selectedSysId,
					selectedConnectionId: "",
					selectedNodeClass: ciData[selectedSysId].properties.sys_class_name.value
				}
			});
		},

		_addNode: function (ciData) {
			//Add the new node
			let node = ciData[selectedSysId];
			let newNode = {
				id: selectedSysId,
				isInactive: false,
				isNewMapNode: true,
				viewData: {
					primaryLabel: node.Name,
					secondaryLabel: node.Class,
					icon: node.icon
				}
			};
			return newNode;
		},

		_addHistory: function (newNode, relevantEdges) {
			historyShowNode(api, newNode);
		},

		_addAlert: function () {
			addAlerts([{
				id: ADD_CI_TO_MAP,
				status: ALERT.STATUS.POSITIVE,
				icon: ALERT.ICON.INFO_CIRCLE_OUTLINE,
				content: api.state.translations.CREATE_A_CONNECTION_TO_ANOTHER_CI_ON_THE_MAP,
				header: api.state.translations.CI_ADDED,
				action: { type: ALERT.TYPE.DISMISS },
				autoDismiss: true
			}], api, helpers);

		},

		updateManageConnectionPanelAndPageProps: function () {
			api.emit('SN_UNIFIED_MAP_CTRL#UPDATE_PAGE_PROPS', {
				params: {
					selectedNodeSysid: selectedSysId,
					selectedConnectionId: '',
					selectedNodeClass: ciData[selectedSysId].properties.sys_class_name.value
				}
			});

			setEditModeManageConnections({
				selectedSourceCi: selectedSysId,
				selectedTargetCi: null,
				selectedRelType: null
			}, api, true);

			if (isConnectButtonClicked) {
				api.emit('SN_UNIFIED_MAP_CTRL#CHANGE_PANEL_TAB', {
					newTabIndex: '2' // Manage Connections panel
				});
				api.setState('connectButtonClicked', false);	
			}
			api.setState("showMultipleEdgeErrorStateEditMode", false);
			
		},

		alignAndShowAlerts: function () {
			helpers.timing.setTimeout(() => {
				api.setState("alignToNode", selectedSysId);
				this._resetStates();
				this._addAlert();
			}, 0);
		},

		_resetStates: function(){ 
			var rowDefintion = cloneDeep(api.state.rowDefinition);
			rowDefintion.rows.forEach((row) => {
				row.isSelected = false;
			});
			api.setState("rowDefinition", rowDefintion);
			api.setState("disableAddToMapButton", false);
		}
	}

	functions.addCiToMapUpdateMap();
}
