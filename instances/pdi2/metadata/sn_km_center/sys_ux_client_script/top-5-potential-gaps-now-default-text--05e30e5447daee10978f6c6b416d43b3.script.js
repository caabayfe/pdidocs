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

    if ((taskTypeId === "incident" && api.state.isGapsITSMConfigured === 1 && gapTaskCount > 0) || (taskTypeId === "sn_customerservice_case" && api.state.isGapsCSMConfigured === 1 && gapTaskCount > 0) || (taskTypeId === "sn_hr_core_case" && api.state.isGapsHRConfigured === 1 && gapTaskCount > 0)) {
        let gapTaskTypeData = api.state.gapTaskTypeData || [];
        const currentGapTypeData = gapTaskTypeData.find(item => item.id === taskTypeId);
        const gapSize = currentGapTypeData ? currentGapTypeData.gapSize : 0;
        if (gapSize === 1) {
            return helpers.translateSync("1 potential gap");
        } else if (gapSize <= 5) {
            return helpers.translateSync("{0} potential gaps", [gapSize]);
        }

        return helpers.translateSync("Top 5 of {0} potential gaps", [gapSize]);
    } else {
        return helpers.translateSync("Top 5 potential gaps");
    }
}
