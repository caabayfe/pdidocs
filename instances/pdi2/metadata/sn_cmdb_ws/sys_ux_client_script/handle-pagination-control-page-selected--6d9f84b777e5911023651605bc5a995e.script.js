/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var pageNum = event.payload.value;
    var pageSize = api.state.pageSize;
    var begin = pageNum*pageSize;
    var end = begin+pageSize;

    var allArrays = api.data.ms_get_queries.output;
    var currentArrays = allArrays.slice(begin,end);
    api.setState('currQueryArray',currentArrays);
}
