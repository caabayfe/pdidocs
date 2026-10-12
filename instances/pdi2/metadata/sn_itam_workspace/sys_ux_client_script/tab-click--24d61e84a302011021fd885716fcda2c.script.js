/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var selectedTabIndex = event.payload.selectedTabIndex;
    var params = {};
    if(api.data.contract_mgmt.output){
        params = api.data.contract_mgmt.output[selectedTabIndex];
    }
        params['selectedTabIndex'] = selectedTabIndex;
        api.emit("CONTENT_UPDATED", {
            params
        });
}
