/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // Hide 'Copy summary' button
    if (api.state.actionStateValue && api.state.actionStateValue === "completed") {
        return true;
    }
    return false;
}
