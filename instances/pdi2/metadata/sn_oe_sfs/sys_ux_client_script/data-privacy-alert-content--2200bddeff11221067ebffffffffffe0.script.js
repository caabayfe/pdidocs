/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.isDataPrivacyAvailable) {
        return helpers.translateSync("Please update to latest data privacy version using the");
    }
    return helpers.translateSync('Please install data privacy using the');
}
