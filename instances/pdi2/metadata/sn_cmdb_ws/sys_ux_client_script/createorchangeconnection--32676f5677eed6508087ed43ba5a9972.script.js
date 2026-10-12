function script({ api, event, helpers, imports }) {
	// createOrChangeConnection script in Map Search Filter UI Controller; fired in edit mode afer the add or change btn is clicked in the manage connections panel
	const { cloneDeep, addAlerts, ALERT, generateUniqueId } = imports["sn_cmdb_ws.unifiedMapUtils"]();
	const { isEdgeEditable, setEditModeManageConnections } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();
	const { historyAddEdge, historyUpdateEdge } = imports['sn_cmdb_ws.unifiedMapEditHistoryUtil']();

	var ciData = api.data.getMapDataController?.ciData;
	var edges = cloneDeep(api.state.edges);
	var selectedItemId = api.context.props.selectedItemId;
	const { selectedSourceCi, selectedTargetCi, selectedRelType } = api.state.editModeManageConnections;
	var edge;

	var functions = {

		createOrChangeConnection: function () {
			if (this.checkForDuplicate()) {
				return;
			}

			if (this.isCiSelectedOrNothingSelected()) {
				this.addEdge();
			} else {
				this.updateEdge();
			}
			this.setNewBaseStateForManageConnectionsIsDirty();
		},

		setNewBaseStateForManageConnectionsIsDirty: function () {
			setEditModeManageConnections({}, api, true);
		},

		addEdge: function () {
			edge = {
				id: generateUniqueId(),
				sourceId: selectedSourceCi,
				targetId: selectedTargetCi,
				_label: selectedRelType,
				relTypeId: this._lookupRelationshipTypeId(selectedRelType),
				port: null,
				isVirtualConnection: false,
				isReference: false,
				endpoints: [],
				sys_created_on: Date.now(),
				style: "solid",
				direction: "original"
			};
			edges.push(edge);
			this._setStateAndShowAlert({
				header: api.state.translations.CONNECTION_CREATED,
				content: api.state.translations.SELECT_SAVE_TO_APPLY_CHANGES_AND_UPDATE_THE_MAP
			});
			this._addEdgeToCiData();
			historyAddEdge(api, edge);
		},

		updateEdge: function () {
			edge = edges.find(e => e.id === selectedItemId);
			if (isEdgeEditable(edge)) {
				edge.sourceId = selectedSourceCi;
				edge.targetId = selectedTargetCi;
				edge._label = selectedRelType;
				edge.relTypeId = this._lookupRelationshipTypeId(selectedRelType);
				this._setStateAndShowAlert({
					header: api.state.translations.CONNECTION_CHANGED,
					content: api.state.translations.SELECT_SAVE_TO_APPLY_CHANGES_AND_UPDATE_THE_MAP
				});
				historyUpdateEdge(api, edge);
				this._updateEdgeInCiData();
                //force the nodemap to re-render since it doesn't update when reversing an edge direction
                helpers.timing.setTimeout(() => {
                    api.emit('SN_NODE_MAP_UNIFIED_CTRL#MAP_DATA_CHANGED', { executeNow: true });
                }, 0);
			} else {
				addAlerts([{
					id: api.state.translations.EDITING_VIRTUAL_AND_REFERENCE_CONNECTION_TYPES_NOT_SUPPORTED,
					autoDismiss: true,
					status: ALERT.STATUS.CRITICAL,
					icon: ALERT.ICON.TRIANGLE_EXCLAMATION_OUTLINE,
					header: api.state.translations.UNSUPPORTED,
					content: api.state.translations.EDITING_VIRTUAL_AND_REFERENCE_CONNECTION_TYPES_NOT_SUPPORTED,
					action: { type: ALERT.TYPE.DISMISS }
				}], api, helpers);
			}
		},

		_addEdgeToCiData: function () {
			ciData[edge.sourceId].connections.push(edge);
		},

		_updateEdgeInCiData: function () {
			var edgeFromCiData =
				ciData[edge.sourceId].connections.find(o => o.id === edge.id) ||
				ciData[edge.targetId].connections.find(o => o.id === edge.id)
			Object.assign(edgeFromCiData, edge);
		},

		checkForDuplicate: function () {
			var isDupe = edges.some(e => e.sourceId === selectedSourceCi && e.targetId === selectedTargetCi && e._label === selectedRelType);
			if (isDupe) {
				addAlerts([{
					id: api.state.translations.CONNECTION_ALREADY_EXISTS,
					autoDismiss: true,
					status: ALERT.STATUS.CRITICAL,
					icon: ALERT.ICON.TRIANGLE_EXCLAMATION_OUTLINE,
					header: api.state.translations.DUPLICATE,
					content: api.state.translations.CONNECTION_ALREADY_EXISTS,
					action: { type: ALERT.TYPE.DISMISS }
				}], api, helpers);
			}
			return isDupe;
		},

		isCiSelectedOrNothingSelected: function () {
			//checks to see if either a node was clicked initially or nothing is selected
			return (selectedItemId && ciData[selectedItemId]) || !selectedItemId;
		},

		_setStateAndShowAlert: function (obj) {
			api.setState('edges', edges); //necessary to trigger nodemap update
			api.setState('editModeManageConnectionsIsDirty', false);
			this._enableSave();
			addAlerts([{
				id: msg,
				autoDismiss: true,
				status: ALERT.STATUS.POSITIVE,
				icon: ALERT.ICON.INFO_CIRCLE_OUTLINE,
				header: obj.header,
				content: obj.content,
				action: { type: ALERT.TYPE.DISMISS }
			}], api, helpers);
		},

		_enableSave: function () {
			var editModeToolbar = cloneDeep(api.state.editModeToolbar);
			editModeToolbar.saveDisabled = false;
			api.setState('editModeToolbar', editModeToolbar);
		},

		_updateEditModeHistory: function (config) {
			edge.editType = config.isAdd ? 'add' : 'update';
			var json = {
				editAction: (config.isAdd ? 'Add Edge' : 'Update Edge'),
				edges: [edge]
			};
			var editModeHistory = [...api.state.editModeHistory]; //less expensive than a clone since we only need the new outer array obj for setState
			editModeHistory.push(json); //keeping this on a separate line to explicitly show its the last entry added
			api.setState('editModeHistory', editModeHistory);
		},

		_lookupRelationshipTypeId: function (relationshipLabel) {
			var allTypes = api.data.get_ci_relationship_types.output.items;
			return allTypes.find(o => o.label === relationshipLabel)?.sys_id;
		}

	};
	functions.createOrChangeConnection();
}
