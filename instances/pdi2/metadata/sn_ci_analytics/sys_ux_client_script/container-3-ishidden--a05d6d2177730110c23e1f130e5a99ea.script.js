/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({
    api
}) {
    return !(api.context.props.conversationPayload && api.context.props.conversationPayload.messages && api.context.props.conversationPayload.messages.length);
}
