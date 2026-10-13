/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    let convId =  api.context.props.conversationPayload
        ? api.context.props.conversationPayload.topicId
        : null;
    if (convId)
        api.data.export_conversation_as_csv_1.execute({
            "conversationId": convId
        });
}
