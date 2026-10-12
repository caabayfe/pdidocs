/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.lastCloneSummary.finished === true)
        return helpers.translateSync('Clone end time');
    return helpers.translateSync('Estimated end time');
}
