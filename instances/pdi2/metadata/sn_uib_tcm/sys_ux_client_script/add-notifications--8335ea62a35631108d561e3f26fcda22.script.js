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
    api.emit('NOW_UXF_PAGE#CLEAR_NOTIFICATIONS');
    const infoMessages = event.payload.notificationMessage;
    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        "items": [{
        "id": "some-error-msg",
        "action": {
            "type": "dismiss"
        },
        "content": infoMessages && infoMessages.message,
        "status": (infoMessages && infoMessages.message_type === "success") ? "positive" : "critical",
        "icon": "info-circle-outline",
    }]
    });
}
