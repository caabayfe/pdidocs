/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.invalidController ? [{
        "status": "critical",
        "content": "Please choose a valid value from the dropdown"
    }] : [];

}
