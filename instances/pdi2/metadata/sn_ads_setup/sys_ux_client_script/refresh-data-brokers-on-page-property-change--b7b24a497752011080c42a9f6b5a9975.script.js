/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.payload.name === "customId") {
        api.data.get_all_categories.refresh();
        api.data.get_all_tasks.refresh();
        api.data.get_setup_info.refresh();
    }
   
}
