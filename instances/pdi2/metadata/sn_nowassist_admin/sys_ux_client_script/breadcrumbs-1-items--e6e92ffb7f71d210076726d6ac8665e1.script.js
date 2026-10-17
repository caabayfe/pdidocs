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
        "id":"settings"
    });
    list.push({
        "label": helpers.translateSync("Data sharing and processing"),
        "id":"data_sharing_processing"
    });
    list.push({
        "label": helpers.translateSync("Data sharing"),
        "id":"data_sharing"
    });
    return list;
}
