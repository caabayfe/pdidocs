/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const collabTaskDetails = api.state.collabTaskDetails;
    return (collabTaskDetails && ((collabTaskDetails.commTaskType && collabTaskDetails.commTaskType.toUpperCase() == 'ACTIVE') || collabTaskDetails.isActive)) ? helpers.translateSync('In Progress') : helpers.translateSync('Pending');
}
