/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var itemsList = [];
    if (api.context.props.prevPage == 'security_center') {
        itemsList.push({
            "href": "/now/security-center-hub/overview",
            "label": helpers.translateSync("Security Center")
        });
    } 
    itemsList.push({
        "href": "/now/access-management/overview",
        "label": helpers.translateSync("Access management")
    }, {
        "label": helpers.translateSync("Access analyzer")
    });
    return itemsList;
}
