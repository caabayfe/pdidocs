/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.overFlowEvent === 'close') return helpers.translateSync("Are you sure you want to close this task?");
    else if (api.state.overFlowEvent === 'snooze') return helpers.translateSync("Are you sure you want to snooze this task?");
}
