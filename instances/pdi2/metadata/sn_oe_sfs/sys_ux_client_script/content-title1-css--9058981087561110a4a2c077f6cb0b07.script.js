/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.item.value && api.item.value.status && api.item.value.status === 'skip')
        return "* { color: rgba(22, 27, 28, 0.3);pointer-events: none;}";
}
