/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const rawNotifications = event.payload.notifications;

    if (rawNotifications) {
        const notifications = rawNotifications.map((notification, index) => ({
            id: `agent-assist-alert-${index}`,
            status: notification.type,
            icon: 'info-circle-outline',
            content: {
                type: 'html',
                value: notification.message
            },
            action: {
                type: 'dismiss'
            }
        }));
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {items: notifications});
    }
}
