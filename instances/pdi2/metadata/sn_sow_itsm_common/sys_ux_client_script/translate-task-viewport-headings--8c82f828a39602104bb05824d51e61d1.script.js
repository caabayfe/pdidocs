/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    api.setState("hideCallerRecords",false);
    api.setState("hideLoader",false);
    let callerLinkHeading = "";
    let emptyStateAndLabel = {...api.state.emptyStateAndLabel};

    callerLinkHeading = await helpers.translate("Recent tasks");
    emptyStateAndLabel.label = await helpers.translate("No recent tasks");
    
    api.setState("callerQuickLinksHeading", callerLinkHeading);
    api.setState("emptyStateAndLabel", emptyStateAndLabel);
}
