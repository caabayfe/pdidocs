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
    api.setState("prevSourceInstanceName", api.state.sourceInstanceName);
    api.setState("prevSourceInstanceId", api.state.sourceInstanceId);
    api.setState("prevSourceInstanceUrl", api.state.sourceInstanceUrl);
    api.setState("sourceInstanceName", event.payload.item.label);
    api.setState("sourceInstanceId", event.payload.value);
    api.setState("sourceInstanceUrl", event.payload.item.instanceUrl);
    
    if (event.payload.value != "currentInstance") {
        api.setState("authenticatingSourceInstance", true);
        helpers.timing.setTimeout(()=>{
            eventHandler.callUtilAPI({
                operation: "CHECK_SOURCE_OAUTH_SETUP",
                instanceUrl: event.payload.item.instanceUrl,
            }, true);
        },50);
    } else {
        api.setState("authenticatingSourceInstance", false);
        api.setState("cloneProfiles", api.state.defaultCloneProfiles);
        api.setState("cloneProfileName", api.state.defaultCloneProfileName);
        api.setState("cloneProfile", api.state.defaultCloneProfile);
        eventHandler.filterTargetInstance(event.payload.value);
        eventHandler.populateCloneProfileData(api.state.defaultCloneProfile,{},event.payload.value);
        //api.data.clone_request_page_data_1.refresh();
    }
}
