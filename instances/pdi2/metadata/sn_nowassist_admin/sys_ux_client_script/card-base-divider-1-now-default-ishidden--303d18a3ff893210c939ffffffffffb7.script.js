/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const versions = api.item.value.versions.filter(item => item.skillType === api.state.skillScope);
    return versions.every(item => !item.oobVersion) ||
        versions.every(item => item.oobVersion);
}
