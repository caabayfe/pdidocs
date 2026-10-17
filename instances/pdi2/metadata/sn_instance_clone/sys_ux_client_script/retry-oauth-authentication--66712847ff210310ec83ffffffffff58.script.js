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
    api.setState('newTargetUrl',api.state.registerInstanceModalParams.newTargetUrl);
    if (api.state.registerInstanceModalParams.oauthAddInstance) {
        eventHandler.callUtilAPI({
            operation: "CHECK_TARGET_OAUTH_ELIGIBLE",
            instanceUrl: api.state.registerInstanceModalParams.newTargetUrl,
            addInstance: api.state.registerInstanceModalParams.oauthAddInstance
        }, true);
    }
    else if(api.state.authenticatingSourceInstance) {
        eventHandler.callUtilAPI({
            operation: "CHECK_SOURCE_OAUTH_SETUP",
            instanceUrl: api.state.sourceInstanceUrl,
        }, true);
    }
    else {
        eventHandler.callUtilAPI({
        operation: "CHECK_TARGET_OAUTH_SETUP",
        instanceUrl: api.state.targetInstanceUrl,
    }, true);
    }
}
