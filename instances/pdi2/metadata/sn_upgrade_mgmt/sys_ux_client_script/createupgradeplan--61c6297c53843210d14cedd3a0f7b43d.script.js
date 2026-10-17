/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var upgradePlanId = api.state.upgradePlanId;
    if(upgradePlanId){
        helpers.modal.open('create_upgrade_plan');
    } else {
        api.setState('createSessionId', '');
        api.setState('createSessionId', api.context.props.experienceProperties.upgrade_session_id.value);
        api.setState('hideLoader', false);
    }
}
