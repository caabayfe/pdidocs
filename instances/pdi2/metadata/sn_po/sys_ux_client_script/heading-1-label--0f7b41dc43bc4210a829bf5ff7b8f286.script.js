/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.findingId != null) {
        return api.state.automatedFindingForm.findingName?.value;
    } else {
        return helpers.translateSync('Create Improvement opportunity definition');
    }
}
