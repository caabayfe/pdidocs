/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("policyName", api?.state?.intermittentPolicyName || '');
    api.setState("UIEmptyValueConditions", api?.state?.emptyValueCondition || []);
}
