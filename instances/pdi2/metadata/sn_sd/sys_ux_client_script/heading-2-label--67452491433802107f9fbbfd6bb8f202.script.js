/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.operationToPerform === "add") {
        return helpers.translateSync("Add new contributing indicator PO project");
    } else {
        return helpers.translateSync("Update contributing indicator PO project");
    }
    return '';
}
