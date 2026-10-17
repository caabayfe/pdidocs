/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("activityState", "COMPLETE");
    api.setState("disableEdit", false);
    api.setState("columnData", api.state.disabledColumnData);
    if(api.state.storeUpgradePreviewID !== api.state.copyOfCopyOfstoreUpgradePreviewID)
        api.setState("copyOfCopyOfstoreUpgradePreviewID", api.state.storeUpgradePreviewID);
    else
        api.data.preserve_current_state_of_the_page_1.refresh();
}
