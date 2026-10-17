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
    api.setState("enableAddInstanceButton",true);
    eventHandler.callUtilAPI({
        operation: "ADD_INSTANCE",
        instanceUrl: api.state.addInstanceUrl,
        userName: api.state.addInstanceUserName,
        password: api.state.addInstancePassword,
        registerInstance: true
    }, true);

}
