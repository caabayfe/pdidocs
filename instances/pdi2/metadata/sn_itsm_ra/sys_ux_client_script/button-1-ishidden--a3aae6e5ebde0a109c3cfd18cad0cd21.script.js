/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        taskTable,
        customExpProps
    } = api.state;
    let actionHistory = true;
    const state = api.state.state;
    const hideCopyResolutionAction = ((state == '6' || state == '7') && taskTable.indexOf("Incident") == -1);
    let actionStateValue;
    if (customExpProps) {
        actionStateValue = customExpProps.actionStateValue;
    }
    // hide custom guidance actions if the action has already been taken upon.
    if (actionStateValue == "new" || actionStateValue == "in_progress" || actionStateValue == "ignored" || actionStateValue == "") {
        actionHistory = false;
    }
    return (taskTable.indexOf("Change Task") != -1 || hideCopyResolutionAction || actionHistory);
}
