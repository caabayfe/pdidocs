/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var datesArray = api.data.get_scan_suite_results_execution_dates_1.output || [];
    api.setState("firstSelectedId", datesArray[1].id);
    api.setState("secondSelectedId", datesArray[0].id);
}
