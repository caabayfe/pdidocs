/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const dueDate = (api.state.collabTaskDetails && api.state.collabTaskDetails.activeCallTime && api.state.collabTaskDetails.activeCallTime.replace(" ", "T") + "Z") || "";
    return new Date(dueDate).valueOf();
}
