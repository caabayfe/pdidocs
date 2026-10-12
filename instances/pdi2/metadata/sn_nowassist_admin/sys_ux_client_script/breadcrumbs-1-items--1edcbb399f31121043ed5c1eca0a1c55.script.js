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
        "id": "settings",
        "label": helpers.translateSync("Settings"),
    });
    list.push({
        "id": "data_sharing_processing",
        "label": helpers.translateSync("Data sharing and processing"),
    });
    list.push({
        "id": "data_overflow",
        "label": helpers.translateSync("Data overflow processing")
    });
    return list;
}
