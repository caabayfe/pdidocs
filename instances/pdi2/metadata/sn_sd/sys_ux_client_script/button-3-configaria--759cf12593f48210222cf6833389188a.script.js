/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let aria = {};
    aria['button'] = {};
    aria['button']['aria-label'] = helpers.translateSync("Review and configure indicator for {0}", api.item.value.name)
    return aria;
}
