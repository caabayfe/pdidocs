function script({api, event}) {
	api.setState('lastRefreshed', {"timestamp": Date.now()}, false);
}
