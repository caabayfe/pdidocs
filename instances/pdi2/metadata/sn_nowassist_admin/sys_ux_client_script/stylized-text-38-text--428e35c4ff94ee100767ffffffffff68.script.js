/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.item.value?.modelAvailableResult?.status?.toLowerCase() === "error" ? helpers.translateSync("Error while checking skill availability.") :
        (api.item.value.action.type === "activate" ? helpers.translateSync("The skill is unavailable in this region. To learn more and enable, click ") : helpers.translateSync('Gen AI request processing changed to global location.'));
}
