/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.emit("COLLAB_UIB#ON_COLLABORATE_CHANNEL_SELECT", {
        eventObj: event
    });
}
