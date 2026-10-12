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
    var invalidNumberOfInteractionsMessage = api.state.invalidNumberOfInteractionsMessage;
    const data = api.data.translations.output;
    if (invalidNumberOfInteractionsMessage) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'conversation_history_settings_alert',
                status: 'critical',
                icon: '',
                content: (data) ? data.mandatory_alert : 'Value for number of conversations to display should be between 1 to 25',
                action: {
                    type: 'dismiss'
                }
            }]
        });
        return;
    }

    var toggleValue = api.state.conversation_history_enabled;
    var sysidForConversationHistoryEnabled = api.data.look_up_sys_prop.result.sys_id.value;

    api.data.update_settings.execute({
        table: "sys_properties",
        recordId: sysidForConversationHistoryEnabled,
        templateFields: "value=" + toggleValue
    });

    var sysidForNumberOfInteractionsProperty = api.data.look_up_for_number_of_interactions.result.sys_id.value;
    var userInput = api.state.number_of_interactions;

    api.data.update_settings.execute({
        table: "sys_properties",
        recordId: sysidForNumberOfInteractionsProperty,
        templateFields: "value=" + userInput
    });

    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            id: 'conversation_history_settings_alert',
            status: 'info',
            icon: 'info-circle-outline',
            content: (data) ? data.conversation_history_settings_success : 'Conversation history settings saved successfully',
            action: {
                type: 'dismiss'
            }
        }]
    });
}
