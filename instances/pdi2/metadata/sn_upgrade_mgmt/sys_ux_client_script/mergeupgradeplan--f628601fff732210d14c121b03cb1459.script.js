/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var sessionID = api.state.sessionId;
    var upgradePlan = {};
    upgradePlan.name = api.state.mergedPlanNameText;
    upgradePlan.notes = api.state.upgradePlanNotes;
    upgradePlan.selectedUpgradePlan = api.state.selectedUpgradePlan;
    upgradePlan.sessionId = api.context.props.experienceProperties.upgrade_session_id.value;
    upgradePlan.targetPatchId = api.state.targetPatchId;
    
    var upgradePlanId = api.state.upgradePlanId;
    if(upgradePlanId){
        helpers.modal.open('apply_upgrade_plan');
    } else {
        api.setState('hideLoader', false);
        api.setState('mergeSessionId', '');
        api.setState('mergeSessionId', api.context.props.experienceProperties.upgrade_session_id.value);
        api.setState('mergePayload', '');
        api.setState('mergePayload', upgradePlan);
    }

}
