/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.emit('OPEN_MOBILE_CHAT_REQUESTED', { chatUrl: '/now/sidebar-mobile/chat/' + event.payload.chatId });
}
