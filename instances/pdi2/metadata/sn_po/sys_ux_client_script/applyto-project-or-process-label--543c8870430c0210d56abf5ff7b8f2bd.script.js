/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const applyToSource = api.state.automatedFindingForm.name?.applyToSource;
    return applyToSource == 'project' ? helpers.translateSync('Apply to project') : helpers.translateSync('Apply to process')
}
