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
    var {
        success,
        message
    } = event.payload.data.output;
    if (success) {
        api.data.list_controller.refreshRequested();
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: "copyLinkAlert",
                status: "positive",
                icon: "check-circle-outline",
                content: message,
                action: {
                    type: "dismiss"
                }
            }]
        });
    } else {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                type: 'error',
                message: message
            }]
        });
    }



}
