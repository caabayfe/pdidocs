function script({ api }) {
	//reloadTimestamp script in GetMapData controller; fired when reloadTimestamp controller input changes
	api.data.getMapDataBroker.refresh();
}
