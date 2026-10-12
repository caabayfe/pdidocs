/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    debugger;
    var isMfaEnabled = api.data.get_mfa_sys_property.result.value.value;
    api.setState('hideMetrics', isMfaEnabled === 'false');
    api.setState('hideError', isMfaEnabled === 'true');
}
