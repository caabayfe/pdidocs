/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let taskTypeId = api.state.gapTaskType;
    let gapTaskCount = api.state.gapTaskCount;

    if ((taskTypeId === "incident" && api.state.isGapsITSMConfigured === 1 && gapTaskCount === -1) || (taskTypeId === "sn_customerservice_case" && api.state.isGapsCSMConfigured === 1 && gapTaskCount === -1) || (taskTypeId === "sn_hr_core_case" && api.state.isGapsHRConfigured === 1 && gapTaskCount === -1)) {
        return true;
    }
    return false;
}
