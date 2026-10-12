/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('workSpaceId', null);
    api.setState('workSpaceLabel', null);
    api.setState('queryCondition', "");
    api.setState('isSessionTabEnabled', false);
}
