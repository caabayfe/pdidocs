/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("deleteSessionId", "");
    api.setState("deleteSessionId", api.state.sessionId);
    helpers.modal.close('cancel_schedule');
    api.setState('hideLoader', false);
}
