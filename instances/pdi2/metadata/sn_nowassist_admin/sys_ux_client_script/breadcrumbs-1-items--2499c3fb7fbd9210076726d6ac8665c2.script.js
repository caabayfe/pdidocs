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
        "route":"plugins"
    });
    !api?.data?.check_regulated_customer_1?.output ?
        list.push({
            "label": helpers.translateSync("Data privacy and sharing"),
        }) : null;
    list.push({
        "label": api?.data?.check_regulated_customer_1?.output ? helpers.translateSync("Data privacy") : helpers.translateSync("Privacy policies"),
    });
    return list;
}
