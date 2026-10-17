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
    
    api.emit('ACE_ACTION_PERFORMED_RELAY_cf3d4cc0c33101104b8e88c7c840ddd8', {
        eventName: event_name,
        eventPayload: {
            button_label: label,
            title,
            subtitle
        }
    });
}
