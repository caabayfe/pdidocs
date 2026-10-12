/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
   
    if (event.payload.name === "customId" && event.payload.value) {
        api.setState('hideEmptyState', true);
        api.data.get_setup_info.refresh(); 
    }
   
}
