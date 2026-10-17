function script({ api, event, helpers, imports }) {
	//nodeContextMenuOpened script in Map Search Filter UI Controller; fired after map's context menu is opened
	const { cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();

	var contextMenu = cloneDeep(api.state.contextMenu);
	contextMenu.items = [];

	var functions = {

		nodeContextMenuOpened: function () {
			this.defineNodeMenu();
			api.setState('contextMenu', contextMenu);
		},

		defineNodeMenu: function () {
			contextMenu.items.push({
				id: 'connectTo',
				label: api.state.translations.CONNECT_TO,
				type: "node",
				behavior: "default"
			});
			this._omitRemoveOptionFromRootNode();
		},

		_omitRemoveOptionFromRootNode: function () {
			if (event.payload?.node?.viewData && event.payload?.node?.isNewMapNode) {
				//add "remove" option only for newly added nodes
				contextMenu.items.push({
					id: 'remove',
					label: api.state.translations.REMOVE,
					type: "node",
					behavior: "default"
				});
			}
		}
	};

	functions.nodeContextMenuOpened();
}
