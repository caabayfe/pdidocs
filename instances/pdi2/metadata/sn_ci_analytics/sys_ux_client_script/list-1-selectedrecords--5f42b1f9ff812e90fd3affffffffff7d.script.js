/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.conversationDetails && api.state.conversationDetails.id ? [api.state.conversationDetails.id] : [];
}
