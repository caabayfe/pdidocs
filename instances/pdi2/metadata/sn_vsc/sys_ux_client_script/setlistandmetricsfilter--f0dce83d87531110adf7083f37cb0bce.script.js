/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var comparisonId = api.data.vsc_compare_scans?.output;
    if (!comparisonId) {
        return;
    }
    // Updating parFilters
    var parFiltersArray = [];
    const metricQuery  = "setting_set_comp=" + comparisonId;
    parFiltersArray.push({
        order: 10,
        type: "query",
        apply_to: ["sn_vsc_changed_hardening_setting"],
        encoded_query: metricQuery
    });
    api.setState("parFilters", parFiltersArray);
    api.setState("listQuery", metricQuery);
    api.setState("listQueryEditable", '');
}
