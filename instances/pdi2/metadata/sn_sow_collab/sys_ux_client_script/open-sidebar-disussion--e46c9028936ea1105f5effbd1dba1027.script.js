/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.emit('SN_COLLAB_CHAT_LIST#OPEN_COLLAB_CHAT_IN_DOCK', {
        id: event.context.item.value.chatSysId
    });
}
