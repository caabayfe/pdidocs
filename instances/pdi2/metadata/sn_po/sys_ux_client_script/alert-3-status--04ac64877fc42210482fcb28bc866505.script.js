/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.idleTimeConfiguration.status) {
        return "info";
    } else {
        return "warning";
    }
}
