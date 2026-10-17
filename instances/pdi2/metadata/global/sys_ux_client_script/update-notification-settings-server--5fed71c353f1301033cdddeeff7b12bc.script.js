/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event}) {
    const vaSetup = api.data.va_settings.output;
    if (vaSetup && vaSetup.chatSettings) {
        const settingsId = vaSetup.chatSettings.sysId;
        const currentValue = vaSetup.chatSettings.notificationsEnabled;
        const newValue = event.payload.value;
        if (settingsId && currentValue !== newValue) {
            // Update notification_enabled value
            api.data.update_notification.execute({
                table: 'sys_cs_live_agent_setup',
                recordId: settingsId,
                templateFields: 'notification_enabled=' + newValue
            });
        }
    }
}
