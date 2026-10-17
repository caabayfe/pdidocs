/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('deleteSessionId', '');
    api.setState('deleteSessionId', api.state.sessionId);
    api.setState('deleteSelectedRecords', []);
    api.setState('deleteSelectedRecords', api.state.uSelectedRecords);
    api.setState('deleteExceptedRecords', []);
    api.setState('deleteExceptedRecords', api.state.uExceptedRecords);
    api.setState('isRemoveDisabled', true);
}
