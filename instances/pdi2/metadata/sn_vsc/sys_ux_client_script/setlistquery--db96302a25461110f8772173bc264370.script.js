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
    var parFiltersArray = [];
    var suite = api.state.selectedSuite;
    var comparisonId = api.data.vsc_scan_comparison_1.output;
    var resultFilter = "comparison_sys_id=" + comparisonId;
    var listQuery = "comparison_scn_suite=" + suite + "^" + resultFilter;
    api.setState("listQuery", listQuery);
    parFiltersArray.push({
        order: 10,
        type: "query",
        apply_to: ["sn_vsc_changed_scan_finding"],
        encoded_query: listQuery
    });

    api.setState("parFilters", parFiltersArray);
}
