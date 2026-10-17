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

    api.setState("authenticateButtonLabel", api.state.text.Authenticating);
    api.setState("authenticatingTargetInstance", true);
    api.setState("disableActionButton", true);
    api.setState("disableSubmitButton", true);
    eventHandler.callUtilAPI({
        operation: "INSTANCE_AUTH",
        instanceUrl: api.state.targetInstanceUrl,
        userName: api.state.targetInstanceUsername,
        password: api.state.targetInstancePassword,
        registerInstance: false
    }, true);

}
