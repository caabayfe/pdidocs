/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
 const payload = event.payload;
 const {name, value, previousValue, hideLoader} = payload;
 if (name === 'refreshRequested' && value?.timestamp !== previousValue?.timestamp) {
    api.emit("RELATED_LIST_REFRESH_REQUESTED",{hideLoader});
 }
}
