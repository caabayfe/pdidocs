/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.projectData.findingSummaryStatusMap?.outOfScopeCountAuto) {
        return helpers.translateSync(' {0} Automated', api.state.projectData.findingSummaryStatusMap.outOfScopeCountAuto);
    }
}
