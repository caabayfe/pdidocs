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
    var intervalId;
    intervalId = helpers.timing.setInterval(() => {
        console.log('Looking for Oauth token');
        eventHandler.callUtilAPI({
            operation: "CHECK_OAUTH_TOKEN",
            targetInstanceUrl: api.state.newTargetUrl,
            intervalId: intervalId,
            addInstance: api.state.oauthAddInstance,
            authenticatingSourceInstance: api.state.authenticatingSourceInstance
        }, false);
    }, 7000);
    api.setState('pollTokenIntervalId',intervalId);
    helpers.timing.setTimeout(() => {
        helpers.timing.clearInterval(intervalId);
    }, 180000);
}
