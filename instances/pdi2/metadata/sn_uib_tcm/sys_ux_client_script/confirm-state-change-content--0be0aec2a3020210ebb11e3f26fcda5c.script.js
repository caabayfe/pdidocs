/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let action = api.state.commTaskToBeUpdated.action;
    if (action == "snooze")
        return helpers.translateSync("Are you sure you want to snooze this task?");
    else
        return helpers.translateSync("Are you sure you want to close this task?");
}
