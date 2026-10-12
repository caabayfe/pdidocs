/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("clearList", null);
    api.setState('selectedUpgradePlan', event.payload.selectedRecords);
    
    if(event.payload.selectionCount > 0) {
        api.setState('isProceedDisabled', false);
        if(event.payload.selectionCount > 1) {
            api.setState('modalApply', 'Merge and apply');
            api.setState('mergedPlanNameText', api.state.newUpgradePlanName);
        } else {
            api.setState('modalApply', 'Apply');
            var upgradePlanName = "Upgrade Plan - " + api.state.targetPatchId;
            api.setState('mergedPlanNameText', upgradePlanName);
        }
    } else {
        api.setState('isProceedDisabled', true);
        api.setState('mergedPlanNameText', "");
    }
}
