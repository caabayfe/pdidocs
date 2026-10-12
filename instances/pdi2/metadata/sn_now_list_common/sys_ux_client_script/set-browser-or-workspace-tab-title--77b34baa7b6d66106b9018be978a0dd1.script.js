/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // set browser and workspace tab title
    if (!event.payload.title) {
        console.warn('ignoring request to set empty tab title');
        return;
    }
    api.emit('SCREEN_STATUS_CHANGED', { title: event.payload.title });
}
