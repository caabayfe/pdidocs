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
    var attachmentSysId = null;
    if (api.data.look_up_attachments.results.length > 0) {
        attachmentSysId = api.data.look_up_attachments.results[0].sys_id.value;
    }
    const sysIdBotIcon = api.data.look_up_bot_icon.results[0].sys_id.value;
    const sysIdBotImage = api.data.look_up_bot_image.results[0].sys_id.value;
    const userInputIcon = api.state.botIcon ? encodeURIComponent(api.state.botIcon) : null;

    if (api.state.botIconDefault) {
        api.data.update_record.execute({
            table: "sys_cs_custom_adapter_property",
            recordId: sysIdBotIcon,
            templateFields: "value=" + null
        });
        if (attachmentSysId != null) {
            api.data.delete_record.execute({
                table: "sys_attachment",
                recordId: attachmentSysId
            });
        }
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'slack_branding_alert',
                status: 'positive',
                icon: 'check-circle-outline',
                content: 'Icon changes saved successfully',
                action: {
                    type: 'dismiss'
                }
            }]
        });
     api.setState('botIcon', 'null');
    } else {
        if (api.state.useImageUrl) {
            if (validateUrl(api.state.botIcon)) {
                api.data.update_record.execute({
                    table: "sys_cs_custom_adapter_property",
                    recordId: sysIdBotIcon,
                    templateFields: "value=" + userInputIcon
                });
                if (attachmentSysId != null) {
                    api.data.delete_record.execute({
                        table: "sys_attachment",
                        recordId: attachmentSysId
                    });
                }
                if (userInputIcon == "" || userInputIcon == null) {
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
                }
                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                        items: [{
                            id: 'slack_branding_alert',
                            status: 'positive',
                            icon: 'check-circle-outline',
                            content: 'Icon changes saved successfully',
                            action: {
                                type: 'dismiss'
                            }
                        }]
                    });
            } else {
                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                    items: [{
                        id: 'slack_branding_alert',
                        status: 'critical',
                        icon: 'exclamation-triangle-outline',
                        content: 'Please input a valid url',
                        action: {
                            type: 'dismiss'
                        }
                    }]
                });
            }
        }
    }

    function validateUrl(value) {
        return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value) || value == null || value == "";
    }
}
