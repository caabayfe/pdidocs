/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.appsInstalledMessages ? api.state.appsInstalledMessages[api.item.value.applications[0].maturityValue][api.item.value.applications[0].weight] : null;
}
