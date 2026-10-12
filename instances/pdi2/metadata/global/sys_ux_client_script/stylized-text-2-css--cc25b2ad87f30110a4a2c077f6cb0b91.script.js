/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.item.value.active == "1")
        return '{background: #6FD00F;padding: 0 0.3rem 0 0.3rem;border-radius: 2px;}';
    return '{background: #EE7482;padding: 0 0.3rem 0 0.3rem;border-radius: 2px;}';
}
