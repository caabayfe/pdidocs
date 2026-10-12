/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(api.state.isProcessing === false)
        return;
    if (!api.data.look_up_exec_tracker_status.results || 
    (api.data.look_up_exec_tracker_status.results && 
    api.data.look_up_exec_tracker_status.results.length > 0 &&
     (api.data.look_up_exec_tracker_status.results[0].state.value === '0' || api.data.look_up_exec_tracker_status.results[0].state.value === '1'))) {
        helpers.timing.setTimeout(function() {
                api.data.look_up_exec_tracker_status.refresh();
        }, 1000);
    } else {
        api.setState("isProcessing", false);
        if(api.state.copyOfstoreUpgradePreviewID !== api.state.storeUpgradePreviewID)   {
            api.setState("copyOfstoreUpgradePreviewID", api.state.storeUpgradePreviewID);   
        }else
            api.data.get_app_preview_list_1.refresh();
    }
}
