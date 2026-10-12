/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const fieldsToDisplay = api.state.fieldsToDisplay;
    const actionStateValue = api.state.actionStateValue;
    if (actionStateValue == "new" || actionStateValue == "in_error") {
        if (fieldsToDisplay || (fieldsToDisplay && fieldsToDisplay.length > 0)) {
            return false;
        }
    }
    return true;
}
