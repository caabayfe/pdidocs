function handler({api, event, imports}) {
	const rlName = event.payload.relatedListName;
	if (rlName) {
		let rlRequests = {...api.state.relatedListRefreshRequests};
		rlRequests[rlName] = { timestamp: new Date().getTime() };
		api.setState('relatedListRefreshRequests', rlRequests);
	}
}
