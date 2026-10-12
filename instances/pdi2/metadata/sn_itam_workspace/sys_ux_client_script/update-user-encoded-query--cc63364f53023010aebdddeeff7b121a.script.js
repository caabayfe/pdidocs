/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var query = `nameLIKE${event.payload.value}^ORemailLIKE${event.payload.value}`; 
    api.setState("encodedQuery", query);
}
