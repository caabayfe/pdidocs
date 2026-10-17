/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('isAutoGenerateActive', false);
    api.setState('agenticBool', 'false');
    api.setState('agenticSessionId', api.state.sessionId);
}
