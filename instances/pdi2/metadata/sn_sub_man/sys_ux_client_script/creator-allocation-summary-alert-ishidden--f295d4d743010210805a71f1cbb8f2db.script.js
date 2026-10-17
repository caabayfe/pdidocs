/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const isMeterTypeCreator = api.state.isMeterTypeCreator;
    const dismissCreatorAllocationSummaryAlert = api.state.dismissCreatorAllocationSummaryAlert;
    if (isMeterTypeCreator) {
        if (dismissCreatorAllocationSummaryAlert) {
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }
}
