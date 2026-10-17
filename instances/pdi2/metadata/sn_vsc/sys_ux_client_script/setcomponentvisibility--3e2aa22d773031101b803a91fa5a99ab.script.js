/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var isAuthEnabled = api?.data?.get_adaptive_auth_policy_status_1?.output?.isAuthPolicyEnabledOnce ?? false;
    api.setState('hideMetrics', !isAuthEnabled);
    api.setState('hideEmptyState', isAuthEnabled);
}
