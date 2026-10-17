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

    const translation = api.data.translations.output
    var isEnabled = api.state.supports_multiple_conversations;
    
    api.data.update_record.execute({
        table: 'sys_cs_channel',
        recordId: 'ea0cb816732110104a905ee515f6a7b5',
        templateFields: 'supports_multiple_conversations='+isEnabled,
        useSetDisplayValue: null
    });

    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            id: 'multiple_active_conversations_alert',
            status: 'info',
            icon: 'info-circle-outline',
            content: (translation) ? translation.multiple_active_conversations_success : 'Multiple Active Conversations saved successfully',
            action: {
                type: 'dismiss'
            }
        }]
    });
}
