/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.repeatType == 'yearly' && api.state.yearlyType == 'float') {
        return false;
    }
    return true;
}
