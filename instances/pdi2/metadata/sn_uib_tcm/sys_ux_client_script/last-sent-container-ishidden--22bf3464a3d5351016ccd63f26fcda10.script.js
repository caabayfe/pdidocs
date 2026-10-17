/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.state.commTaskDetails || !api.state.commTaskDetails.communication_frequency || !api.state.commTaskDetails.status) return true;
    return !(api.state.commTaskDetails.communication_frequency == "recurring" && api.state.commTaskDetails.status != "Not sent");
}
