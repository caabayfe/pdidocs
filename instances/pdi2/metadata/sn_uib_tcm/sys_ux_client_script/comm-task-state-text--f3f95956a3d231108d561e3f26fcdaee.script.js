/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const commTaskDetails = api.state.commTaskDetails;
    return (commTaskDetails && commTaskDetails.comm_count && commTaskDetails.communication_frequency && commTaskDetails.comm_count > 0 && commTaskDetails.communication_frequency != 'one_time') ? helpers.translateSync("In progress") : helpers.translateSync("Pending");
}
