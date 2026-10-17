/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.projectData.findingSummaryStatusMap?.outOfScopeCount) {
        return helpers.translateSync('{0} finding def(s)', api.state.projectData.findingSummaryStatusMap.outOfScopeCount);
    }
}
