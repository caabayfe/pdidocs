/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("sessionId", api.context.props.experienceProperties.sessionid.value);
    api.setState('selectScheduleTime', '');
    api.setState('currentDateTime', []);
}
