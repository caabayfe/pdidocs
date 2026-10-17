/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('programmaticCloseRegisterModal',true);
    const eventHandler = imports["sn_instance_clone.CloneRequestPageEventHandler"](api, helpers);
    if(api.state.oauthAddInstance) {
        api.setState('addInstanceUrl',api.state.newTargetUrl);
        helpers.modal.open('add_target_instance_modal');
    }
    else if(api.state.authenticatingSourceInstance) {
        helpers.modal.open('source_authentication');
    }
    else {
        eventHandler.openAuthenticationModal();
    }
    helpers.timing.setTimeout(()=>{
        helpers.modal.close('register_instance');
    },500);
    helpers.timing.setTimeout(()=>{
        api.setState('newTargetUrl','');
        api.setState('hideClientIDContainer', true);
        api.setState('disableNewTargetButton', true);
        api.setState('targetClientID','');
        api.setState('disableCompleteSetupBtn', true);
        api.setState('hideOauthErrorSetup', true);
        api.setState('oauthAddInstance', false);
        api.setState('programmaticCloseRegisterModal',false);
    },1200);    
}
