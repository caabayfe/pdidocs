/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.state.projectData.showSummary) {
        return helpers.translateSync('Mining Progress');
    } else {
        return helpers.translateSync('Mining Summary');
    }
}
