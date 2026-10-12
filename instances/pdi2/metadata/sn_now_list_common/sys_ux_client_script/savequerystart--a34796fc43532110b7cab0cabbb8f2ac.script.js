/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.timing.setTimeout(() => {
        api.emit('EDIT_FILTERS#SAVE_QUERY_END_d7f34c9343432110b7cab0cabbb8f24b');
    }, 1500);
    
}
