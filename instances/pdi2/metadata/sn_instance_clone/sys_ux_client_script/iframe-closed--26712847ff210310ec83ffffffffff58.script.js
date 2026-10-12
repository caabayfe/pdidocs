/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.timing.clearInterval(api.state.pollTokenIntervalId);
    const eventHandler = imports["sn_instance_clone.CloneRequestPageEventHandler"](api, helpers);
    eventHandler.callUtilAPI({
        operation: "IFRAME_CLOSED"
    }, true);
}
