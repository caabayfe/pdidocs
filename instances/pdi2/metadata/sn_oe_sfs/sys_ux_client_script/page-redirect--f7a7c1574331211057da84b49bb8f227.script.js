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
    if (api.data.record) {
        if (api.data.record.isNew) {
            const translation = api.data.ci_admin_console__translations.output;

            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'multiple_active_conversations_alert',
                    status: 'info',
                    icon: 'info-circle-outline',
                    content: (translation) ? translation.consumer_account_context_success : 'New consumer account context saved successfully',
                    action: {
                        type: 'dismiss'
                    }
                }]
            });
        }
    }
}
