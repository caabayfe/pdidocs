/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const eventHandler = imports["sn_instance_clone.ListPageEventHandler"](api, helpers);
    api.setState('newTargetUrl',api.state.registerInstanceModalParams.newTargetUrl);
    if(!api.state.registerInstanceModalParams.newTargetUrl) {
        helpers.modal.close('register_instance');
        helpers.timing.setTimeout(()=>{helpers.modal.open('register_instance');},50);
    }
    else {
        eventHandler.callUtilAPI({
            operation: "CHECK_TARGET_OAUTH_ELIGIBLE",
            instanceUrl: api.state.registerInstanceModalParams.newTargetUrl,
        },true);
    }
}
