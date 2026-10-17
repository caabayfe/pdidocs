/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.modal.open('select_upgrade_plan');
    api.setState('isProceedDisabled', true);
    api.setState('selectedUpgradePlan', '');
    api.setState('mergedPlanNameText', '');
    api.setState("refreshTimeStamp", new Date().getMilliseconds());
}
