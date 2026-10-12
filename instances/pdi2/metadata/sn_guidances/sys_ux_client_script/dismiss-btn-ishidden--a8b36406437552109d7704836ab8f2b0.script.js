/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // Hide dismiss button for search
    if (api.state.customExpProps && api.state.customExpProps.useCase.toLowerCase() == "search") {
        return true;
    }
    const actionStateValue = api.state.actionStateValue;
    if (actionStateValue == "new" || actionStateValue == "in_error") {
        return false;
    }
    return true;
}
