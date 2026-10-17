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
    if (api.state.authenticatingSourceInstance) {
        api.setState("sourceInstanceName", api.state.prevSourceInstanceName);
        api.setState("sourceInstanceId", api.state.prevSourceInstanceId);
        api.setState("sourceInstanceUrl", api.state.prevSourceInstanceUrl);
        eventHandler.closeSourceInstanceAuthenticationError();
        helpers.modal.close("source_authentication");
        api.setState('authenticatingSourceInstance',false);
    }
}
