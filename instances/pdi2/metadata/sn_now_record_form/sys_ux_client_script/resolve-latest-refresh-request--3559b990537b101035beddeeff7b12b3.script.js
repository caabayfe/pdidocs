function handler({api, event, imports}) {
	if (event.payload !== undefined && (event.payload.name === 'refreshRequested' || event.payload.name === 'tabsRefreshRequestLog')) {
		const directRefresh =  (event.payload.name === 'refreshRequested') ? event.payload.value : api.context.props.refreshRequested;
		const tabRefreshReqs = (event.payload.name === 'tabsRefreshRequestLog') ? event.payload.value : api.context.props.tabsRefreshRequestLog;
		const relatedListName = api.context.props.relatedListName;
		const externalRefresh = tabRefreshReqs[relatedListName];

		let resolvedRefresh = directRefresh;
		if (externalRefresh && externalRefresh.timestamp && directRefresh.timestamp)
			resolvedRefresh = (externalRefresh.timestamp > directRefresh.timestamp) ? externalRefresh : directRefresh;
		else if (externalRefresh && externalRefresh.timestamp)
			resolvedRefresh = externalRefresh;
		api.setState('latestRefreshRequest', resolvedRefresh);
	}
}
