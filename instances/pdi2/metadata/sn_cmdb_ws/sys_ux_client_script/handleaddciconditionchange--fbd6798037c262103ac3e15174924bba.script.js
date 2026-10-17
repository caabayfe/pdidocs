function script({ api, event, helpers, imports }) {
	var newCBQuery = event.payload?.updatedQuery;
	var addCiPriorClassQuery = api.state.addCiPriorClassQuery;

	if (addCiPriorClassQuery) {
		if (newCBQuery === addCiPriorClassQuery) {
			newCBQuery = '';
		}
		api.setState("addCiPriorClassQuery", '');
	}

	api.setState("addCiToMapCBQuery", newCBQuery);
}
