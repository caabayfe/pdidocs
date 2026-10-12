/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return {
        "role": "link",
        "aria-label": helpers.translateSync('View details of {0}', api.item.value.name)
    };
}
