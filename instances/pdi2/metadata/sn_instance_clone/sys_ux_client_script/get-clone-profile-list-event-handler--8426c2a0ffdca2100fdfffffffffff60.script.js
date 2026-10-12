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
    eventHandler.closeSourceInstanceAuthenticationError();
    api.setState("authenticatingSourceInstance", false);
    eventHandler.callUtilAPI({
        operation: "GET_CLONE_PROFILE_LIST",
        instanceUrl: api.state.sourceInstanceUrl,
        username: api.state.sourceInstanceUsername,
        password: api.state.sourceInstancePassword
    }, true);
}
