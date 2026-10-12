/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let totalScreens = api.context.props.payload.children.length;
    if (totalScreens >= 3) {
        return false;
    } else {
        return true;
    }
}
