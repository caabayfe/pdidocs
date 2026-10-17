/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.currentTabs.find((element) => element.id == api.state.selectedMetric).resultsLabel + ": "+api.item.value.name;
}
