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
    const eventHandler = imports["sn_instance_clone.CloneRequestPageEventHandler"](api, helpers);
    api.setState('oauthAddInstance',api.state.registerInstanceModalParams.oauthAddInstance);
    if (api.state.registerInstanceModalParams.oauthAddInstance) {
        api.setState('newTargetUrl', '');
        api.setState('hideClientIDContainer', true);
        api.setState('disableNewTargetButton', true);
        api.setState('targetClientID', '');
        api.setState('disableCompleteSetupBtn', true);
        api.setState('hideOauthErrorSetup', true);
    } else if (api.state.authenticatingSourceInstance) {
        eventHandler.callUtilAPI({
            operation: "CHECK_SOURCE_OAUTH_ELIGIBLE",
            instanceUrl: api.state.sourceInstanceUrl,
            addInstance: false
        }, true);
    } else {
        eventHandler.callUtilAPI({
            operation: "CHECK_TARGET_OAUTH_ELIGIBLE",
            instanceUrl: api.state.targetInstanceUrl,
            addInstance: false,
            reset: true
        }, true);
    }
}
