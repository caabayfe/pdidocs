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
    const state = api.state.state;
    let useCase, actionStateValue;
    if (customExpProps) {
        useCase = customExpProps.useCase;
        actionStateValue = customExpProps.actionStateValue;
    }
    const hideCopyResolutionAction = ((state == '6' || state == '7') && taskTable.indexOf("Incident") == -1);
    let actionHistory = true;
    // hide custom guidance actions if the action has already been taken upon.
    if (actionStateValue == "new" || actionStateValue == "in_progress" || actionStateValue == "ignored" || actionStateValue == "") {
        actionHistory = false;
    }
    return (useCase == "search" || hideCopyResolutionAction || actionHistory);
}
