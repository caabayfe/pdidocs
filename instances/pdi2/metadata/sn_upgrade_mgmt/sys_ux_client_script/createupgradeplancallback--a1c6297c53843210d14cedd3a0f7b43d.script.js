/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var res = api.data.createUpgradePlan.output;
    var upgradePlanName = res.upgradePlanName;
    var upgradePlanId = res.upgradePlanId;
    var successMessage = upgradePlanName;
    api.setState('successMessage', successMessage);
    api.setState('hideSuccess', false);
    api.setState('hideLoader', true);
    api.setState('disableComplete', false);
    //api.setState('hideGeneratePlan', false);
    api.setState('upgradePlanId', upgradePlanId);
}
