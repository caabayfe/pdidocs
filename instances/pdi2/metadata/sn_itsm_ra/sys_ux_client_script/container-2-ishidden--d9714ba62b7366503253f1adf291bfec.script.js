/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let citationButtons = api.state.citationsList;
    if (citationButtons.length > 0)
        return false;
    else
        return true;
}
