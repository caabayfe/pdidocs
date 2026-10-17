/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(api.data.ms_get_queries && api.data.ms_get_queries.output) {
        var disableViewSavedQueriesBtn = (api.data.ms_get_queries.output.length < 1) ? true : false;
        api.setState('disableViewSavedReportBtn',disableViewSavedQueriesBtn);
    }
}
