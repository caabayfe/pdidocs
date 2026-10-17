/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var allArrays = api.data.ms_get_queries.output;
    var currentArrays = allArrays.slice(api.state.beginIndex,api.state.pageSize);
    api.setState('currQueryArray',currentArrays);
}
