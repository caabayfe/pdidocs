/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    helpers.modal.close("oauth_guidance_modal");
    if(!api.state.programmaticCloseRegisterModal) {
        if(api.state.oauthAddInstance) {
            api.setState("targetInstanceId", undefined);
        }
        api.setState('newTargetUrl', '');
        api.setState('hideClientIDContainer', true);
        api.setState('disableNewTargetButton', true);
        api.setState('targetClientID', '');
        api.setState('disableCompleteSetupBtn', true);
        api.setState('hideOauthErrorSetup', true);
        api.setState('oauthAddInstance', false);
        api.setState('encryptedSourceUrl', '');
        if (api.state.authenticatingSourceInstance && !api.state.registerInstanceModalParams.authInProgress) {
            let _currInstance = api.state.sourceInstances.find((el) => {
                return el.id == "currentInstance";
            });
            api.setState("sourceInstanceName", _currInstance.label);
            api.setState("sourceInstanceId", _currInstance.id);
            api.setState("sourceInstanceUrl", _currInstance.instanceUrl);
            api.setState('authenticatingSourceInstance',false);
        }
        helpers.modal.close('register_instance');
    }
}
