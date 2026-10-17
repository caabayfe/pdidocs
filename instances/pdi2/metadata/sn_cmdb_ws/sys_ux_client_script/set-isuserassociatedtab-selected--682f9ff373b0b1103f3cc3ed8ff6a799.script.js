/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { payload } = event.payload;
    const { payload: { selectedTabIndex }} = event;
    
    // set what tab we are in and then clear the search term
    if (selectedTabIndex == 0) {
        api.setState("isUserAssociatedTab", false);
    } else if(selectedTabIndex == 1) {
        api.setState("isUserAssociatedTab", true);
    }
    api.data.deduplication_template_filter_tasks.refresh();
}
