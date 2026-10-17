/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.hideLoader == false ? true : ((api.state.type == '' && api.state.totalRecord > 0) ?
        false : true);
}
