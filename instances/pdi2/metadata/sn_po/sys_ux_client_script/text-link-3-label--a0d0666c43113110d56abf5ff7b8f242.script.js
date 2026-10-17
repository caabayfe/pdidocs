/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.projectData.findingSummaryStatusMap?.noMatchingRecordsCountRule) {
        return helpers.translateSync('{0} Rule based', api.state.projectData.findingSummaryStatusMap.noMatchingRecordsCountRule);
    }
}
