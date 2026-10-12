/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('cancelBoqId', '');
    api.setState('cancelBoqId', api.state.boqId);
    api.setState('cancelSessionId', '');
    api.setState('cancelSessionId', api.state.sessionId);
    api.setState('isCancelDisabled', true);
    api.setState('isStatusDisabled', true);
    api.setState('isRefreshDisabled', true);
    api.setState('showLoading', false);
}
