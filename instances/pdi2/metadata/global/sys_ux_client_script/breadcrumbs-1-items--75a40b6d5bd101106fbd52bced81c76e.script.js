/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
    const data = api.data.translations.output;
    const items = [];
    items.push({
        id: 'agent-chat',
        label: (data) ? data.virtual_agent : 'Agent Chat'
    });
    items.push({
        id: 'conversation_history_settings',
        label: (data) ? data.conversation_history_settings : 'Conversation History Settings'
    });
    return items;
}
