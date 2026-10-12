/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var query = `display_nameLIKE${event.payload.value}^ORserial_numberLIKE${event.payload.value}`;  
    api.setState("assetEncodedQuery", query); 
}
