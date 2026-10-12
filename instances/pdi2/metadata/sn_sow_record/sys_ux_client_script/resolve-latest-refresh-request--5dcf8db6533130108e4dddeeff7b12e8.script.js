function handler({api, event, imports}) {
    if (event.payload !== undefined && event.payload.name === 'tabsRefreshRequestLog') {
        const directRefresh = api.state.latestRefreshRequest;
        const tabRefreshReqs = event.payload.value;
        const relatedListName = api.state.relatedListName;
        const externalRefresh = tabRefreshReqs[relatedListName];

        if (externalRefresh && externalRefresh.timestamp && (externalRefresh.timestamp > directRefresh.timestamp)) {
            api.setState('latestRefreshRequest', externalRefresh);
        }
    }
}
