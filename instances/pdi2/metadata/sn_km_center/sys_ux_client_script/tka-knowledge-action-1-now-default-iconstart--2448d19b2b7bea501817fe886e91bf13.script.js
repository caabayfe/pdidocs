/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var icons = {
        [helpers.translateSync("Incident Gap")]: "document-plus-outline",
        [helpers.translateSync("Case Gap")]: "document-plus-outline",
        [helpers.translateSync("Duplicates")]: "documents-outline",
        [helpers.translateSync("Article Optimization")]: "lightbulb-outline"
    };

    const type = api.item.value.type;
    return icons[type];
}
