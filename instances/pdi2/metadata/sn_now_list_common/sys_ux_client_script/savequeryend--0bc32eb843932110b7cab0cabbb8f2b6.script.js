/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.emit('_LIST_CTRL#SET_QUERY_RELAY_d7f34c9343432110b7cab0cabbb8f24b', { encodedQuery: api.state.filterQuery });
    helpers.modal.close();
}
