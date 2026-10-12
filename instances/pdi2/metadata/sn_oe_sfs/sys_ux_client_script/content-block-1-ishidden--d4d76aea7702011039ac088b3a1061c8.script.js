/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let actionData = api.state.actionsData[0];
    if (actionData) {
        return false;
    }
    return true;
}
