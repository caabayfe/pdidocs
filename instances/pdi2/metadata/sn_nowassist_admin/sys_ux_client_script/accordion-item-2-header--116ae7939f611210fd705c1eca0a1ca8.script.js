/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var faqHeader2 = {
        "label": helpers.translateSync("Will my performance be impacted if I opt out?"),
        "size": "md",
        "variant": "primary",
        "weight": "normal"
    };
    return faqHeader2;
}
