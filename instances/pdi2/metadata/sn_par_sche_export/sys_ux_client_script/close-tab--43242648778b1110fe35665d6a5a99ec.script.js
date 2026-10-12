/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const isClose = event.payload && (event.payload.isSaveAndClose || event.payload.isClose);
    if(isClose) {
        api.emit('SCREEN_STATUS_CHANGED', {status: 'closed'});
        return;
    }
}
