/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.item && api.item.value && api.item.value.collapsible !== null) {
        return api.item.value.collapsed ? "chevron-down-outline" : "chevron-up-outline";
    }
}
