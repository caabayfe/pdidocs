function script({ api, event, helpers, imports }) {
	//changeConnectionType script in Map Search Filter UI Controller; handler for CONTEXT_MENU_ITEM_CLICKED event
	const { setEditModeManageConnections } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();

	var functions = {
		changeConnectionType: function () {
			var edge = event.payload.edge;

			//need to workaround COE bug where it serves up a node object prop when an edge is clicked 
			//  however, the node object contains edge props so we can work with it until the defect if fixed
			//  (DEF0625088, DEF0632561)
			if (!edge && event.payload.node.sourceId) {
				edge = event.payload.node;
			}
			this._updatePageProps(edge);
			setEditModeManageConnections({
				selectedSourceCi: edge.sourceId,
				selectedTargetCi: edge.targetId,
				selectedRelType: edge._label,
				buttonLabel: api.state.translations.CHANGE
			}, api, true);
			
			api.setState('editModeManageConnectionsIsDirty', false);
		},

		_updatePageProps: function(edge){
			if(edge?.id && api.context.props.selectedItemId !== edge.id) {
				api.emit('SN_NODE_MAP_UNIFIED_CTRL#SELECT_ELEMENT', { "elementId": edge.id });
				api.emit('SN_UNIFIED_MAP_CTRL#UPDATE_PAGE_PROPS', { params: {
					selectedNodeSysid: "",
					selectedConnectionId: edge.id,
					selectedNodeClass: ""
				}});
			}
		}
	};
	
	functions.changeConnectionType();
}
