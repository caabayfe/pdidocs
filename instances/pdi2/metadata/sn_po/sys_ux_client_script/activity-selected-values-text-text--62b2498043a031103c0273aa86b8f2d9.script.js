/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let prefix = api.state.activityForm.fields.activityValuesChoice == "ALL" || api.state.activityForm.fields.activityValuesChoice == null ? helpers.translateSync('Selected activity values') : "";
    if (api.state.activityForm.fields.activityValuesChoice == "INCLUDE") {
        prefix = helpers.translateSync('Included activity values');
    } else if (api.state.activityForm.fields.activityValuesChoice == "EXCLUDE") {
        prefix = helpers.translateSync('Excluded activity values');
    }
    if (api.state.selectedActivityFieldDetails && api.state.selectedActivityFieldDetails.internalType === api.state.INTERNAL_TYPES.BOOLEAN) {
        prefix = helpers.translateSync('Selected activity value');
    }
    return api.state.activityForm.fields.activityValues.selectedValuesLabels.length > 0 ? `${prefix}: ${api.state.activityForm.fields.activityValues.selectedValuesLabels.join(', ')}` : `${prefix}: All`;
}
