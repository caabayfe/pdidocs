/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(event.payload.selectedTabIndex === 1 && !api.data.upcoming_links_data_resource_tomorrow.output)
        api.data.upcoming_links_data_resource_tomorrow.refresh();
}
