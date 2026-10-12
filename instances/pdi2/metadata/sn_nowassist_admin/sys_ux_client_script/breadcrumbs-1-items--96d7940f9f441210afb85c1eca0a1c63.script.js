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
    var productName = api?.state?.productName;
    list.push({
        "label": helpers.translateSync("Settings"),
        "id":"settings"
    });
    list.push({
        "label": helpers.translateSync("Now Assist Guardian: Offensiveness"),
        "id":"now_assist_guardian_op"
    });
    list.push({
        "label": helpers.translateSync("Offensiveness for {0}", productName),     
        "id":"offensiveness"
    });
    return list;
}
