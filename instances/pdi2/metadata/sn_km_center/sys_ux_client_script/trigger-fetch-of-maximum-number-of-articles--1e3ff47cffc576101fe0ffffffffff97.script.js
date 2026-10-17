/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    
    // Triggers the fetch of the maximum amount of articles by
    // changing the state of rowLimit, which is used by the
    // "Process pages of flagged articles"
    api.setState('rowLimit', 10000);
    // Triggers the loading conditional renderer while the data
    // resources are fetching the larger amount of data. 
    api.setState('loadingAllArticles', true);
}
