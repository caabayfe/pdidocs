/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.item && api.item.value) {
        return api.item.value.collapsible == null ? true : !api.item.value.collapsed;
    }
    return true;
}
