function script({ api, event, helpers, imports }) {
	//reloadMap in mapSearchFilterController; fired when reload button is clicked
	const { ALERT, addAlerts } = imports["sn_cmdb_ws.unifiedMapUtils"]();
	const { RELOAD_MAP } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();
	let ciSysid = api.context.props.ciSysid;
	api.setState("disableReloadButton", true);
	let date = Date.now().toString();
	//Reset the root node when there is an error and the root node does not match the mapSearchFilterController rootNode state value
	if (api.data.getMapDataController.errors.length && api.state.rootNode && ciSysid !== api.state.rootNode) {
		api.emit("SN_UNIFIED_MAP_CTRL#ROOT_NODE_SET", {
			params: {
				rootNode: api.state.rootNode,
				selectedNodeSysid: api.state.rootNode,
			},
		});
	} else {
		api.setState("reloadTimestamp", date);
	}
	api.setState("relatedItemCache", {});
	helpers.translate("Map reloading...").then((translatedText) => {
		addAlerts([{
			id: RELOAD_MAP,
			status: ALERT.STATUS.INFO,
			icon: ALERT.ICON.INFO_CIRCLE_OUTLINE,
			content: translatedText,
			action: { type: ALERT.TYPE.DISMISS }
		}], api);
	});
}
