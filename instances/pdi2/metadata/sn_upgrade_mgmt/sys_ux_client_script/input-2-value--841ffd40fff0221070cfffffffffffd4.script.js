/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.selectedRecordsNames.length > 1) {
        return 'Multiple selected';
    }
    return api.state.selectedRecordsNames[0];
}
