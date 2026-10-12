/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.data.look_up_resolution_framework_enabled.result.value.value === 'true' || api.state.health.overall.health === "GREEN")
        return true;
    return false;
}
