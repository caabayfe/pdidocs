/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var faqHeader4 = {
        "label": helpers.translateSync("How do I opt back in to cloud bursting?"),
        "size": "md",
        "variant": "primary",
        "weight": "normal"
    };
    return faqHeader4;
}
