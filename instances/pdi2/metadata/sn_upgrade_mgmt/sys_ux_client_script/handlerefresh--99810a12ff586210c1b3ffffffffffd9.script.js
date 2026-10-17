/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('sessionIdTemp', '');
    api.setState('sessionIdTemp', api.state.sessionId);
    api.setState('refreshButton', true);
}
