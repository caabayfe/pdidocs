/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const selectedTab = event.payload.selectedTabIndex;
    if(selectedTab === 1)
        api.setState("hideViewAllButton", true);
    else
        api.setState("hideViewAllButton", false);
}
