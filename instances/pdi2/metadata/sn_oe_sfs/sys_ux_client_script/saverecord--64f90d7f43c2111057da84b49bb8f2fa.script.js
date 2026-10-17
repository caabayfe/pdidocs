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
    const translation = api.data.ci_admin_console__translations.output;

    var invalidMinutes = api.state.invalid_number_minutes;
    var invalidHours = api.state.invalid_number_hours;

    if(invalidMinutes || invalidHours){
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'email_notification_settings_alert',
                status: 'critical',
                icon: '',
                content: (translation) ? translation.invalid_inputs : 'There are fields with invalid input values. Please correct them.',
                action: {
                    type: 'dismiss'
                }
            }]
        });
        return;
    }

    var enable = api.state.email_digest_enabled;
    var treshold = api.state.threshold;
    var minutes = api.state.custom_minutes;
    var hours = api.state.custom_hours;

    const fieldValues = 'enable_email_digest=' +enable+
        '^custom_hours=' +hours+
        '^custom_minutes=' + minutes+
        '^threshold=' +treshold;
        
    const recordId = api.data.email_notification_settings_record.result;

    if (recordId == null || recordId == ''){
        api.data.create_record.execute({
            table: 'sys_cs_email_notification_settings',
            templateFields: fieldValues,
            useSetDisplayValue: null    
        });
        api.data.email_notification_settings_record.refresh();
    }else{
        api.data.update_record.execute({
            table: 'sys_cs_email_notification_settings',
            recordId: recordId.sys_id.value,
            templateFields: fieldValues,
            useSetDisplayValue: null
        });
    }

     api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            id: 'email_notification_settings_alert',
            status: 'info',
            icon: 'info-circle-outline',
            content: (translation) ? translation.email_notification_settings_success : 'Email notification settings saved successfully',
            action: {
                type: 'dismiss'
            }
        }]
    });
}
