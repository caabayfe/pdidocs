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
    api.setState('userHasInteracted', false);
    const eventHandler = imports["sn_instance_clone.CloneRequestPageEventHandler"](api, helpers);
    var cloneProfileId = event.payload.value;
    api.setState("cloneProfileName", event.payload.item.label);
    api.setState('cloneProfile',cloneProfileId);
    eventHandler.populateCloneProfileData(cloneProfileId, event.payload.item, '', event.payload.item.isByOAuth);
}
