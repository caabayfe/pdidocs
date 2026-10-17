/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('loadMoreLoading', true);
    // To have loading effect for a fraction of second
    helpers.timing.setTimeout(function() {
        var chats = api.state.collabChats;
        var currentChats = api.state.currentChats;
        currentChats = chats.slice(0, currentChats.length + 50);
        api.setState('currentChats', [...currentChats]);
        api.setState('loadMoreLoading', false);
    }, 0);
    api.emit('COLLAB_UIB#REFRESH_SEARCH_AND_FILTER_ARRAY');
}
