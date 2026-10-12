/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("refreshTimeStamp", new Date().getMilliseconds());
    api.setState('isRunTestsDisabled', true);
    api.setState('sendSessionId', '');
    api.setState('sendSessionId', api.state.sessionId);
    api.setState('sendSelectedRecords', []);
    api.setState('sendSelectedRecords', api.state.selectedRecords);
    api.setState('selectedRecords', []);
}
