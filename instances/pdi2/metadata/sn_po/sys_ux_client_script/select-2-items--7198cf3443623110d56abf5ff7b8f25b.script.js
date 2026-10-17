/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    function sort(arr) {
        return arr.sort((a, b) => a.label?.localeCompare(b.label));
    }

    if (api.state.projectDetails?.canAccessPaDashboard == false) {
        return sort([...api.state.kpiDashboardData, {
            id: api.state.projectDetails.paDashboardId,
            label: api.state.projectDetails.paDashboardName,
        }]).filter((paDashboard) => paDashboard.id !== null);
    }

    return sort(api.state.kpiDashboardData);
}
