/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.modal.open('confirm_1', {});
    api.setState('hideModal', false);
    api.setState('tempIarState', event.payload.value);
}
