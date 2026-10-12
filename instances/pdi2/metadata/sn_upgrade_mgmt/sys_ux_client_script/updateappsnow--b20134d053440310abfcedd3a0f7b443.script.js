/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('hideLoader', false);
    api.setState("upgradeSessionId", '');
    api.setState("upgradeSessionId", api.state.sessionId);
    api.setState("hideUpdateNow", true);
    api.setState("hideScheduleUpdate", true);
}
