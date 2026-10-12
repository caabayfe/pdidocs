/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var res = api.data.Get_upgradePlan_status.output;
    var radioLoad = res.genNewUpgradePlan;
    var newUpgradePlanName = res.newUpgradePlanName;
    var upgradePlanName = res.upgradePlanName;
    var upgradePlanId = res.upgradePlanId;
    var targetPatchId = res.targetPatchId;
    var sessionType = res.sessionType;
    
    if(radioLoad){
        api.setState('selectedRadio', 'true');
        api.setState('hideNewCard', false);
        api.setState('hideExistingCard', true);
        api.setState('cardExisting', false);
        api.setState('cardNew', true);
    } else {
        api.setState('selectedRadio', 'false');
        api.setState('hideNewCard', true);
        api.setState('hideExistingCard', false);
        api.setState('cardNew', false);
        api.setState('cardExisting', true);
    }
    api.setState('newUpgradePlanName', newUpgradePlanName);
    api.setState('hideLoader', true);
    api.setState('upgradePlanName', upgradePlanName);
    api.setState('upgradePlanId', upgradePlanId);
    api.setState('targetPatchId', targetPatchId);
    api.setState('upgradeSessionType',sessionType);

    if(upgradePlanName){
        var successMessage = upgradePlanName;
        api.setState('successMessage', successMessage);
        api.setState('hideSuccess', false);
        //api.setState('hideGeneratePlan', false);
        api.setState('disableComplete', false);
    }
}
