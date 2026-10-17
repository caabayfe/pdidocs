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
    api.emit('ACE_ACTION_PERFORMED_RELAY_018e6fb953122110453cddeeff7b12ab', {
        eventName: event.name,
        eventPayload: event.payload
    });

}
