/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var list = [];
    list.push({
        "label": helpers.translateSync("Settings"),
        "id": "settings"
    });
    list.push({
        "label": helpers.translateSync("Manage Integration"),
        "id": "manage_integration"
    });
    return list;
}
