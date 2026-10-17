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
    const errors = event.payload.errors;
    api.emit('NOW_UXF_PAGE#CLEAR_NOTIFICATIONS');
    api.setState("showLoader", false);
    for (let i = 0; errors && i < errors.length; i++) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            "items": [{
                "id": "channel-error-message-" + [i],
                "action": {
                    "type": "dismiss"
                },
                "content": errors[i].message,
                "status": "critical",
                "icon": "circle-exclamation-outline"
            }]
        });
    }
}
