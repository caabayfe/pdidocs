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
    let table = api.state.callerQuickLinksTable;
    let callerLinkHeading = "";
    let emptyStateAndLabel = {...api.state.emptyStateAndLabel};
    if(table == "incident") {
        callerLinkHeading = await helpers.translate("Recent incidents");
        emptyStateAndLabel.label = await helpers.translate("No recent incidents");
    } else if (table == "interaction") {
        callerLinkHeading = await helpers.translate("Recent interactions");
        emptyStateAndLabel.label = await helpers.translate("No recent interactions");
    } else if (table == "alm_asset") {
        callerLinkHeading = await helpers.translate("Assigned assets");
        emptyStateAndLabel.label = await helpers.translate("No assets");
    }
    
    api.setState("callerQuickLinksHeading", callerLinkHeading);
    api.setState("emptyStateAndLabel", emptyStateAndLabel);
}
