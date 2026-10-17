/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(event && event.payload){
        api.setState("ci_search_built_query", event.payload.value);
    }
    
}
