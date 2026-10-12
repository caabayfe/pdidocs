/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        internalType: fieldInternalType
    } = api.state.selectedActivityFieldDetails;
    if (fieldInternalType == api.state.INTERNAL_TYPES.STRING || ((fieldInternalType == api.state.INTERNAL_TYPES.REFERENCE || fieldInternalType == api.state.INTERNAL_TYPES.CHOICE) && api.state.fieldSelectValuesListItems.length == 0)) {
        return helpers.translateSync('Selected field has no values');
    } else {
        return '';
    }
}
