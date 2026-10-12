/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    let translatedText = await helpers.translate('Chat client notification settings saved successfully');
    translatedText = translatedText || 'Chat client notification settings saved successfully';

    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            id: 'va_notification_update_success_alert',
            status: 'info',
            icon: 'info-circle-outline',
            content: translatedText,
            action: {
                type: 'dismiss'
            }
        }]
    });
}
