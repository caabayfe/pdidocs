/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var activePolicyExist = api.data.fetch_data_privacy_config.results.length > 0;
    api.setState("isActivePrivacyPolicyAvailable", activePolicyExist);
}
