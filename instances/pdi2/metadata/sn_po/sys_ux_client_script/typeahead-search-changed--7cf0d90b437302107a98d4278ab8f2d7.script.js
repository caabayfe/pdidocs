/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.payload.actionSource !== "select") {
        api.setState('configTableSearchTerm', event.payload.value);
        api.setState('selectedProcessTable', null);
    }
    else {
        api.setState('inputInvalid', false);
    }
}
