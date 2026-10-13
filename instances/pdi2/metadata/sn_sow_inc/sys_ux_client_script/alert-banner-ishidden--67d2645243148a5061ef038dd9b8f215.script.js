/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.accessPermission.canViewPirSlaBanner) {
        return false;
    } else {
        return true;
    }
}
