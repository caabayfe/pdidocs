/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var numberOfInteractions = event.payload.fieldValue;
    api.setState('number_of_interactions', numberOfInteractions);
}
