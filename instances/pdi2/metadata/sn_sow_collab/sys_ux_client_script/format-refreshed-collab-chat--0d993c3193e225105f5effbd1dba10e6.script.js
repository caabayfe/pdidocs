/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (!api.data.fetch_one_collab_chat_1.output || !api.data.fetch_one_collab_chat_1.output.length)
        return;
    var refreshedChat = api.data.fetch_one_collab_chat_1.output[0];
    var chats = api.state.collabChats;
    var currentChats = api.state.currentChats;
    var chatIndex = chats.findIndex((chat => chat.chatSysId == refreshedChat.chatSysId)); 
    if (chatIndex != -1) {
        chats[chatIndex] = refreshedChat;
        if (chatIndex < currentChats.length) 
            currentChats[chatIndex] = refreshedChat;
    } else {
        currentChats.unshift(refreshedChat);
        chats.unshift(refreshedChat);
    }
    api.setState('collabChats', [...chats]);    
    api.setState('currentChats', [...currentChats]);
    api.emit('REFRESH_SEARCH_AND_FILTER_ARRAY');
}
