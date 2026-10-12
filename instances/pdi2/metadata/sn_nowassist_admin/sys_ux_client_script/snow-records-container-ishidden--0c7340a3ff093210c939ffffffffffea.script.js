/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return !api.item.value.versions.some(item => item.oobVersion && item.skillType === api.state.skillScope);
}
