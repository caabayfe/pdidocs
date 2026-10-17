/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return (api.state.coverageWeightsType === "automatic" || api.item.value.exclude == true);
}
