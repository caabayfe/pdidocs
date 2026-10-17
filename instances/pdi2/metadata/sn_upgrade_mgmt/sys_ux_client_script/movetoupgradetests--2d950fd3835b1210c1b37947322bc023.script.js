/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    api.setState('availableSessionId', '');
    api.setState('availableSessionId', api.state.sessionId);
    api.setState('availableSelectedRecords', []);
    api.setState('availableSelectedRecords', api.state.aSelectedRecords);
    api.setState('availableExceptedRecords', []);
    api.setState('availableExceptedRecords', api.state.aExceptedRecords);
    api.setState('isMoveDisabled', true);
}
