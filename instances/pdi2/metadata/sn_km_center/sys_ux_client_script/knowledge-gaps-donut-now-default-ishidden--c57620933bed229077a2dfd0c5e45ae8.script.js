/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // gapTaskCount, isGapsITSMConfigured and isGapsCSMConfigured are all initialized as -1.
    // This statement will return false (show visualization) only if:
    //   - isGapsITSMConfigured in case of Incidents isGapsCSMConfigured in case of Cases and  is exactly 1 (active)
    //   - AND gapTaskCount is greater than 0 (there are duplicates)
    // In all other cases (including loading), returns true (hides the state).
    if (api.state.gapTaskType === "incident") {
        return api.state.isGapsITSMConfigured !== 1 || api.state.gapTaskCount <= 0;
    } else if (api.state.gapTaskType === "sn_customerservice_case") {
        return api.state.isGapsCSMConfigured !== 1 || api.state.gapTaskCount <= 0;
    } else if (api.state.gapTaskType === "sn_hr_core_case") {
        return api.state.isGapsHRConfigured !== 1 || api.state.gapTaskCount <= 0;
    } else {
        return true;
    }
}
