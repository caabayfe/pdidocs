/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.modal.close('confirm_1', {});
    api.setState('hideModal', true);
    //api.setState('iar_enabled', api.state.iarEnabled);
}
