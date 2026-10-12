/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    //@data.recent_rules_activities_on_table.output
    var rows = api.data.recent_rules_activities_on_table.output;
    if (!(rows && rows.length))
        return [];

    var ruleTypeFilter = api.state.ruleTypeSelection;
    // If there is a filter on RuleType, apply it
    if (ruleTypeFilter && ruleTypeFilter !== 'ALL_TYPES') {
        rows = rows.filter(row => row.ruleType == ruleTypeFilter);
    }

    var currentPage = api.state.activityCurrentPage;
    var rowsPerPage = api.state.actvitiesPerPage;

    var startIndex = currentPage * rowsPerPage;
    var endIndex = Math.min(startIndex + rowsPerPage, rows.length);
    return rows.filter((obj, index) => {
        return index >= startIndex && index < endIndex;
    });
}
