/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let value = {"delete": "true"};
    api.setState('formFieldAndValuesFinal', value);
    api.setState("deleteRecord", true);
}
