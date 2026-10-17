/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const formData = api.data.gform;
    api.emit('ACE_ACTION_PERFORMED_RELAY_e527c89219410110f87733dbe4f9549f', {
        eventName: event.name,
        eventPayload: formData
    });
}
