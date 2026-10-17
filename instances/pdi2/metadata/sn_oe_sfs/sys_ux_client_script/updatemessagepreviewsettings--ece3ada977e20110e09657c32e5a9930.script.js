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
    const sysIdForPollFrequency = api.data.lookup_poll_frequency.result.sys_id.value;
    const userInput = api.state.poll_frequency;
    api.data.update_settings.execute({
        table: "sys_properties",
        recordId: sysIdForPollFrequency,
        templateFields: "value=" + userInput
    });
    const toggleValue = api.state.show_message_preview;
    const sysIdForMessagePreviewEnabled = api.data.lookup_show_message.result.sys_id.value;
    api.data.update_settings.execute({
        table: "sys_properties",
        recordId: sysIdForMessagePreviewEnabled,
        templateFields: "value=" + toggleValue
    });
    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            id: 'message_preivew_settings_alert',
            status: 'info',
            icon: 'info-circle-outline',
            content: 'Message Preview settings saved successfully',
            action: {
                type: 'dismiss'
            }
        }]
    });
}
