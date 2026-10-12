/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var faqHeader1 = {
        "label": helpers.translateSync("What is data processing during traffic overflow or cloud bursting?"),
        "size": "md",
        "variant": "primary",
        "weight": "normal"
    };
    return faqHeader1;
}
