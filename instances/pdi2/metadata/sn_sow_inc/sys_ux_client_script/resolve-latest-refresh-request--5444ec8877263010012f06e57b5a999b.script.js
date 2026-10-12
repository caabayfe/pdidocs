/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    if (event.payload == undefined) {
        return;
    }
    else if (event.payload.name === 'tabsRefreshRequestLog') {
        const directRefresh = api.state.latestRefreshRequest;
        const tabRefreshReqs = event.payload.value;
        const relatedListName = api.state.selectedImpactRelatedList.relatedListName;
        const externalRefresh = tabRefreshReqs[relatedListName];

        if (externalRefresh && externalRefresh.timestamp && (externalRefresh.timestamp > directRefresh.timestamp)) {
            api.setState('latestRefreshRequest', externalRefresh);
        }
    }
    else if (event.payload.name === 'relatedLists') {
        const selectedRlData = api.state.selectedRelatedListData;
        if (selectedRlData) {
            const rlData = event.payload.value;
            let rl = rlData.find(item => item.value == selectedRlData.relatedListName);
            if (rl && (selectedRlData.count != rl.count || selectedRlData.timestamp < rl.refreshRequested.timestamp)) {
                api.setState("latestRefreshRequest", {
                    timestamp: Date.now()
                });
            }
        }
    }
}
