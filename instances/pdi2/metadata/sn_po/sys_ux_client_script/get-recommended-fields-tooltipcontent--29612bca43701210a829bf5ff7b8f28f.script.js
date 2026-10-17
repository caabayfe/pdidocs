/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.activityRecommendations.length > 0) {
        return helpers.translateSync('Get recommended fields');
    }
}
