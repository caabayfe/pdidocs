/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.projectData.ismining) {
        return helpers.translateSync("View Progress");
    } else if(api.state.projectData?.miningState?.value == "NEW"){
        return helpers.translateSync("Mine Project");
    } else {
        return helpers.translateSync("Remine Project");
    }
}
