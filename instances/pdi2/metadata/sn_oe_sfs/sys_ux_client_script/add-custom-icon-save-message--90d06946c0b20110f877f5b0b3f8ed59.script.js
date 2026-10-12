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
    if (api.state.imageUploadChanged && api.state.imageDeleted) {
        api.setState('iconRadioButtonState', [{
            "id": "default",
            "label": "Use default icon",
            "checked": true
        }, {
            "id": "custom",
            "label": "Use custom icon"
        }]);
        api.setState('botIconDefault', true);
        api.setState("useImageUrl", false);
        api.setState('imageDeleted', false);
    }
    if (api.state.imageUploadChanged) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'slack_branding_alert',
                status: 'positive',
                icon: 'check-circle-outline',
                content: 'Image changes saved successfully',
                action: {
                    type: 'dismiss'
                }
            }]
        });
        const sysIdBotIcon = api.data.look_up_bot_icon.results[0].sys_id.value;

        api.data.update_record.execute({
            table: "sys_cs_custom_adapter_property",
            recordId: sysIdBotIcon,
            templateFields: "value=" + null
        });
        api.setState('imageUploadChanged', false);
        api.setState('botIcon', 'null');
    } 
    
}
