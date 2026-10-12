/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.data.fetch_all_collaboration_chats_1.output && api.data.fetch_all_collaboration_chats_1.output.chats) {
        var chats = api.data.fetch_all_collaboration_chats_1.output.chats;
        api.setState('collabChats', chats);
        api.setState('currentChats', chats.slice(0, 50));
        api.emit('REFRESH_SEARCH_AND_FILTER_ARRAY');
    }
}
