/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const sendNotification = async () => {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'shareNotesSuccess',
                status: 'positive',
                icon: 'check-circle-outline',
                content: await helpers.translate('Meeting notes shared with attendees'),
                action: {
                    type: 'dismiss'
                }
            }]
        });
    };
    sendNotification();
}
