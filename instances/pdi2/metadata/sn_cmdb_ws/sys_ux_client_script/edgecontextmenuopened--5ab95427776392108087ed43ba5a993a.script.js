function script({ api, event, helpers, imports }) {
	//edgeContextMenuOpened script in Map Search Filter UI Controller; fired after map's context menu is opened
	const { cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();
	var contextMenu = cloneDeep(api.state.contextMenu);
	contextMenu.items = [];

	var functions = {

		edgeContextMenuOpened: function () {
			this.defineEdgeMenu();
			api.setState('contextMenu', contextMenu);
		},

		defineEdgeMenu: function () {
			this._omitRemoveConnectionOptionFromNumberedEdges();
		},

		_omitRemoveConnectionOptionFromNumberedEdges: function () {
			//add edge menu options if an edge was right clicked and it's not a numbered edge
			if (event.payload?.edge?.sourceId && !event.payload?.edge?.isMergedEdge) {
				contextMenu.items.push({
					id: 'changeConnectionType',
					label: api.state.translations.CHANGE_CONNECTION,
					type: 'edge',
					behavior: 'default'
				});
				contextMenu.items.push({
					id: 'removeConnection',
					label: api.state.translations.DELETE_CONNECTION,
					type: 'edge',
					behavior: 'default'
				});
			}
		}
	};

	functions.edgeContextMenuOpened();
}
