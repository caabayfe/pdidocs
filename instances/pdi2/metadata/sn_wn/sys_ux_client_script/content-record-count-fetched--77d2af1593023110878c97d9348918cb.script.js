/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var res = api.data.get_wn_content_total_count_1.output.result;
    api.setState('totalRecordCount', res.total);
}
