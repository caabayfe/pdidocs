/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var tabIndex = event.payload.selectedTabIndex;
    if(event.payload.isInitialPageLoad){
        return;
    }
    if(tabIndex == 0) {
        api.data.get_list_of_published_dedup_templates.refresh();
    }else if(tabIndex == 1) {
        api.data.get_running_dedupe_templates.refresh();
    }else if(tabIndex == 2) {
        api.data.get_list_of_run_completed_templates.refresh();
    }
}
