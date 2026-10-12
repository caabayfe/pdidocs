/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.feedbackMessage && api.state.feedbackMessage.length > 1500)
        return true;

    return !(api.state.feedbackMessage || api.state.starRatings);
}
