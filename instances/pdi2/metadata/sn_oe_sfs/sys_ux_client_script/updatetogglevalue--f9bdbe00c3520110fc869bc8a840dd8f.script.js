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
    var toggleValue = event.payload.value;
    var conversationHistoryEnabled = toggleValue ? toggleValue : false;

    api.setState('conversation_history_enabled', conversationHistoryEnabled);
}
