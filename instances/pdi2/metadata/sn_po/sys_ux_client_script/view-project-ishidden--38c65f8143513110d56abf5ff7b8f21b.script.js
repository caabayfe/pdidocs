/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if ((api.state.projectData.showSummary==false) || (api.state.projectData?.miningState?.value != "AVAILABLE")) {
        return true;
    } else {
        return false;
    }
}
