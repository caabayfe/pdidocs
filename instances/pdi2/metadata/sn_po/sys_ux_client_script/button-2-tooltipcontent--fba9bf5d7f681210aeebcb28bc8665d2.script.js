/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.selectedProcessTable ?
        helpers.translateSync("Get started") :
        helpers.translateSync("Select process table to get started");
}
