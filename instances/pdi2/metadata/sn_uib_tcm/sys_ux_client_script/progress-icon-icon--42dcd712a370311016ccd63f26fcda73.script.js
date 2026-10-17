/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.state.commTaskDetails) return;
    const commTaskDetails = api.state.commTaskDetails;
    return (commTaskDetails && commTaskDetails.comm_count && commTaskDetails.communication_frequency && commTaskDetails.comm_count > 0 && commTaskDetails.communication_frequency != 'one_time') ? "circle-semi-check-outline" : "lock-outline";
}
