/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var aria_properties = {"button" : ""};
    aria_properties['button'] = { "aria-label": helpers.translateSync('Attach and add link in comment') };
    return aria_properties;
}
