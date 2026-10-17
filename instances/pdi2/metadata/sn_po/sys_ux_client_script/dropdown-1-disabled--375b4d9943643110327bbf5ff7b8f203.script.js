/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.currentView == "Landing" && api.state.totalFindingsCount == 0 ? true : false;
}
