/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (!event || !event.payload) return;
    api.emit("COLLAB_UIB#CONFERENCE_CARD_CLICKED_RELAY", event.payload);
}
