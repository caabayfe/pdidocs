/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var msQueries = api.data.ms_get_queries.output; 
    //to show only the first 20 queries in the Saved queries preview
    api.setState("msQueries",msQueries.slice(0,20));
}
