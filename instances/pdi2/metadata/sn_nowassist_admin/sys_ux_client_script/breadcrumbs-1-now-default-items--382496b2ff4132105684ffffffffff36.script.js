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
        "label": helpers.translateSync("Manage model providers"),
        "id": "manage_model_providers"
    });
    list.push({
        "label": helpers.translateSync("Edit model provider"),
        "id": "edit_model_provider"
    });
    return list;
}
