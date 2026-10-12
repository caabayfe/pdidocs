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
    const eventHandler = imports["sn_instance_clone.ListPageEventHandler"](api, helpers);
    var intervalId;
    intervalId = helpers.timing.setInterval(() => {
        eventHandler.callUtilAPI({
            operation: "CHECK_OAUTH_TOKEN",
            targetInstanceUrl: api.state.newTargetUrl,
            intervalId: intervalId,
        }, false);
    }, 2500);
    api.setState('pollTokenIntervalId',intervalId);
    helpers.timing.setTimeout(() => {
        helpers.timing.clearInterval(intervalId);
    }, 180000);
}
