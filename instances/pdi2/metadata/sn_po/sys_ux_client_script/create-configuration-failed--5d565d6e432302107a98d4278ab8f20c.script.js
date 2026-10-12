/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.payload.errors.length > 0) {
        api.setState('errorMessage', event.payload.errors[0].message);
    }
    api.setState('creatingNewConfigurationInprogress', false);
}
