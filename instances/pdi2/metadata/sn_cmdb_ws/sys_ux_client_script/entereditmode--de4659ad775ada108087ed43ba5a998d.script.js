function script({ api, event, helpers, imports }) {
	//enterEditMode script in Map Search Filter UI Controller; fired afer the editMode watcher scriptlet inputs change
	const { setContextMenus, isEdgeEditable, getEdgePropsToAlterForEditMode, setEditModeManageConnections, 
		getEditModeNodemapBtnConfig } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();
	const { getConnections, cloneDeep, mergeDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();

	var editModeManageConnections = cloneDeep(api.state.editModeManageConnections)
	var selectedItemId = api.context.props.selectedItemId;
	var ciData = api.data.getMapDataController?.ciData;
	var edge;
	
	var functions = {

		enterEditMode: function() {
			this.fetchRelTypes();
			this.sanitizeMapForEditMode();
			setContextMenus({ editMode: true }, api);
			this.sortAndPopulateCiDropdownListItemsForManageConnectionsPanel();
			this.setSelectedItemsForManageConnectionsPanel();
			setEditModeManageConnections(editModeManageConnections, api, true);
		},

		fetchRelTypes: function() {
			api.data.get_ci_relationship_types.refresh();
		},
	
		sanitizeMapForEditMode: function() {
			this._disableMinimap();
			this._removeColoredNodeBadgingAndEnableDisabledNodes();
			this._disableUnsupportedEdgesAndEnableDisabledNodes();
			this._decorateUnsupportedEdges();
			this._closeFilterPanelIfOpen();
			this._setNodemapButtonsForEditMode();
		},
		
		_disableMinimap: function() {
			api.setState('disableMinimap', true);
		},
		
		_removeColoredNodeBadgingAndEnableDisabledNodes: function() {
			api.state.nodes.forEach((node) => {
				delete node.viewData.status;
				delete node.viewData.statusMessage;
				delete node.viewData.indicatorIcon;
				node.isInactive = false;
			});
			// api.setState('nodes', [...api.state.nodes]);
		},
		
		_disableUnsupportedEdgesAndEnableDisabledNodes: function() {
			var edgesToDisable = api.state.edges.reduce((acc, edge) => {
				if (!isEdgeEditable(edge)) {
					acc.push(edge.id);
				}
				return acc;
			}, []);
			var filterOutput = cloneDeep(api.state.filterOutput);
			filterOutput.inactiveEdges = edgesToDisable;
			filterOutput.inactiveNodes = [];
			api.setState('filterOutput', filterOutput);
		},
	
		_decorateUnsupportedEdges: function() {
			var edges = cloneDeep(api.state.edges);
			var propsToManage = getEdgePropsToAlterForEditMode(api);
			edges.forEach((edge) => {
				if (!isEdgeEditable(edge)) {
					this._addEdgeProps(edge, propsToManage);
				}
			});
			
			api.setState('edges', edges);
			api.setState('alignToNode', api.context.props.ciSysid);
		},

		sortAndPopulateCiDropdownListItemsForManageConnectionsPanel: function () {
			var filterData = api.state.filterOutput;
			var ciDropdownInput = api.state.nodes
			.filter(n => !filterData.hiddenNodes.includes(n.id))
			.sort((a, b) => {
				//sort CIs by name first
				return a.viewData.primaryLabel.toLowerCase().localeCompare(b.viewData.primaryLabel.toLowerCase())
			}).map((o) => {
				return {
					id: o.id,
					label: o.viewData.primaryLabel,
					sublabel: o.viewData.secondaryLabel
				};
			});
	
			editModeManageConnections.nodes = ciDropdownInput;
		},
	
		_addEdgeProps: function(edge, propsToManage) {
			propsToManage.forEach((prop) => {
				edge[prop.name] = prop.value;
			});
		},

		setSelectedItemsForManageConnectionsPanel: function () {
			//check if node selected
			if (selectedItemId && ciData[selectedItemId]) {
				editModeManageConnections = mergeDeep(editModeManageConnections, {
					selectedSourceCi: selectedItemId,
					selectedTargetCi: null,
					selectedRelType: null,
					buttonLabel: api.state.translations.CREATE_CONNECTION
				});
				api.setState("isSupportedEdgeForEditMode", true);
			} else if (selectedItemId) { //must be an edge
				edge = getConnections(ciData).find(o => o.id === selectedItemId);
				api.setState("isSupportedEdgeForEditMode", selectedItemId.includes('_') || isEdgeEditable(edge));
				this._checkEdgeIsValid();
				editModeManageConnections = mergeDeep(editModeManageConnections, {
					selectedSourceCi: edge.sourceId,
					selectedTargetCi: edge.targetId,
					selectedRelType: edge._label,
					buttonLabel: api.state.translations.CHANGE
				});
				
			} else { //Nothing selected
				editModeManageConnections = mergeDeep(editModeManageConnections, {
					selectedSourceCi: null,
					selectedTargetCi: null,
					selectedRelType: null,
					buttonLabel: api.state.translations.CREATE_CONNECTION
				});
			}
			api.setState('editModeManageConnectionsIsDirty', false);
		},

		_checkEdgeIsValid: function () {
			//Check if the edge is a supported edge (eg: Not a reference, end point..) or if the edge is a fake numbered edge
			if ((!edge && selectedItemId.includes('_')) || !isEdgeEditable(edge)) {
				//just avoids console error for now; ideally we turn numbered edges off when entering edit mode; discuss with PM
				edge = {
					selectedSourceCi: null,
					selectedTargetCi: null,
					selectedRelType: null
				};
				if((selectedItemId.includes('_'))){
					api.setState("showMultipleEdgeErrorStateEditMode", true);
				}
			}
		},

		_closeFilterPanelIfOpen: function () {
			var filterControls = cloneDeep(api.state.filterControls);
			filterControls.filterPanel.isHidden = true;
			api.setState('filterControls', filterControls);
		},

		_setNodemapButtonsForEditMode: function () {
			api.setState('nodemapButtonItems', getEditModeNodemapBtnConfig());
		}

	};

	functions.enterEditMode();
}
