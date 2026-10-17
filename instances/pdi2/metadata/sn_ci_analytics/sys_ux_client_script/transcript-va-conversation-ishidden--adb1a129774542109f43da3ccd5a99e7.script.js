/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
    return !(api.context.props.conversationPayload && api.context.props.conversationPayload.messages && api.context.props.conversationPayload.messages.length);
}
