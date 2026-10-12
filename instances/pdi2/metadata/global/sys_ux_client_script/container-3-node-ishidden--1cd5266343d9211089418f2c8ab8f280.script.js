/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.repeatType == 'weekly' || api.state.repeatType == 'specific') {
        return false;
    }
    return true;
}
