/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.filterFeatureVal && api.state.filterFeatureVal.length > 0 ? api.state.filterFeatureVal[0].id : "All";
}
