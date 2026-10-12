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
    const sysIdBotName = api.data.look_up_bot_name.results[0].sys_id.value;
    const userInput = (api.state.botName && api.state.botName != 'Now Virtual Agent') ? api.state.botName : null;
    api.data.update_record.execute({
        table: "sys_cs_custom_adapter_property",
        recordId: sysIdBotName,
        templateFields: "value=" + userInput
    });
    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            id: 'slack_branding_alert',
            status: 'positive',
            icon: 'check-circle-outline',
            content: 'Name saved successfully',
            action: {
                type: 'dismiss'
            }
        }]
    });
    if(userInput == null) { api.setState('botName', 'Now Virtual Agent') };
}
