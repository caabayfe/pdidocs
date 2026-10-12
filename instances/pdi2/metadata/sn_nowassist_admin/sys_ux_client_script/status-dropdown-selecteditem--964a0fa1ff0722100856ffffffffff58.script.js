/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.filterStateVal && api.state.filterStateVal.length > 0 ? api.state.filterStateVal[0].id : "All";
}
