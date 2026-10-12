/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers

}) {
    if (api.state.gapTaskType === "incident") {
        return api.state.isGapsITSMConfigured !== 0 || api.state.gapTaskCount === -1;
    } else if (api.state.gapTaskType === "sn_customerservice_case") {
        return api.state.isGapsCSMConfigured !== 0 || api.state.gapTaskCount === -1;
    } else if (api.state.gapTaskType === "sn_hr_core_case") {
        return api.state.isGapsHRConfigured !== 0 || api.state.gapTaskCount === -1;
    } else {
        return false;
    }
}
