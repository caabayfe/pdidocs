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
    const {
        label, event_name, title, subtitle
    } = event.payload;
    
    api.emit('ACE_ACTION_PERFORMED_RELAY_e252a3cb43b1211043a2888d8ab8f242', {
        eventName: event_name,
        eventPayload: {
            button_label: label,
            title,
            subtitle
        }
    });
}
