/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var faqHeader3 = {
        "label": helpers.translateSync("Who can opt out of cloud bursting?"),
        "size": "md",
        "variant": "primary",
        "weight": "normal"
    };
    return faqHeader3;
}
