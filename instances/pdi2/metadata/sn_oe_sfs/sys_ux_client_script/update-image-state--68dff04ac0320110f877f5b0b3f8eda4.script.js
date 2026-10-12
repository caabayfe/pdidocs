/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('imageUploadChanged',true);
    if (event.payload.fieldName == 'image' && event.payload.value == '') {
        api.setState('imageDeleted', true);
    } else {
        api.setState('imageDeleted', false);
    }
}
