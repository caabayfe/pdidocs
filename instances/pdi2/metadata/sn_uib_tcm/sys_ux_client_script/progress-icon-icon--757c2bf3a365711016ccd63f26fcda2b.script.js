/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return (api.state.collabTaskDetails && api.state.collabTaskDetails.commTaskType && api.state.collabTaskDetails.commTaskType.toUpperCase() == "ACTIVE") ? "circle-semi-check-outline" : "lock-outline";
}
