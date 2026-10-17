/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let chatId = event.payload.results.chatId;
    if (chatId) {
        api.emit('OPEN_URL_ON_MOBILE', { url: `/now/sidebar-mobile/chat/${chatId}` });
    }
}
