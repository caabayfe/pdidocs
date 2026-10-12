/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    var assignedSuite = api.data.sc_get_user_assigned_comparison.output || [];
    var selSuite = assignedSuite[2].suite;
    api.setState("selectedSuite", selSuite);
    api.data.get_scan_suite_results_execution_dates_1.execute({
        suite: selSuite
    });
}
