/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.selectedConfigListItems.length > 1) {
        return helpers.translateSync("Delete process configurations?");
    }
    return helpers.translateSync("Delete process configuration?");
}
