/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.selectedActivityFieldDetails.internalType == api.state.INTERNAL_TYPES.BOOLEAN) {
        return false;
    }
    return api.state.selectedActivityValues.length === 0;
}
