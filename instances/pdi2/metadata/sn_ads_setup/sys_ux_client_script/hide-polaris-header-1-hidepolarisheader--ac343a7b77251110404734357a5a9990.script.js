/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.context.props && api.context.props.hidePolarisHeader == 'true') {
        return true;
    }
    return false;
}
