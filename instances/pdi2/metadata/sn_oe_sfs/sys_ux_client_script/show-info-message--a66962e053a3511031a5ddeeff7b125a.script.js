/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    let msg = api.state.infoMessage;
    let translatedText = await helpers.translate('{0}', msg);
    translatedText = translatedText || msg;
    api.setState('infoMessage', '');

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
