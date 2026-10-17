/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let confDetails = api.state.confDetails;
    if (!confDetails) {
        return true;
    }
    return !(confDetails.active && api.state.actionsToDisplay.length > 0);
}
