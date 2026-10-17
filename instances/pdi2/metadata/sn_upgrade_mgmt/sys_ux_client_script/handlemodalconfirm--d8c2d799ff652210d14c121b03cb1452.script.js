/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var ids = api.state.testSysIds;
    ids = (ids === "") ? ids : ids.split(',');
    api.setState('sendSessionId', '');
    api.setState('sendSessionId', api.state.sessionId);
    api.setState('sendSelectedRecords', []);
    api.setState('sendSelectedRecords', ids);
    api.setState('sendExceptedRecords', []);
    api.setState('sendExceptedRecords', api.state.exceptedRecords);
}
