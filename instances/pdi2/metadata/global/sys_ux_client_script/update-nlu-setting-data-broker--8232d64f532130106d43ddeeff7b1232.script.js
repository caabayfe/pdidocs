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
    const {
        nlu_settings,
        nlu_settings_alerts
    } = api.state;

    if (!nlu_settings)
        return;

    const {
        nlu_enabled,
        nlu_driver,
        auto_select_prompt_enabled_mid,
        auto_select_prompt_enabled_initial,
        auto_select_prompt_message
    } = nlu_settings;

    const fieldValues = 'nlu_enabled=' + (nlu_enabled ? nlu_enabled.value : false) +
        '^nlu_driver=' + (nlu_driver ? nlu_driver.value : null) +
        '^auto_select_prompt_enabled_mid=' + (auto_select_prompt_enabled_mid ? auto_select_prompt_enabled_mid.value : false) +
        '^auto_select_prompt_enabled_initial=' + (auto_select_prompt_enabled_initial ? auto_select_prompt_enabled_initial.value : false) +
        '^auto_select_prompt_message=' + (auto_select_prompt_message ? auto_select_prompt_message.value : 'NULL');

    const showConfirmationMessage = (auto_select_prompt_enabled_mid && auto_select_prompt_enabled_mid.value) || (auto_select_prompt_enabled_initial && auto_select_prompt_enabled_initial.value);
    const show_mandatory_fields_alert = !((nlu_driver && nlu_driver.value && nlu_driver.value != 'select') && (!showConfirmationMessage || (auto_select_prompt_message && auto_select_prompt_message.value != "")));
    const data = api.data.translations.output;
    if (nlu_enabled && nlu_enabled.value && show_mandatory_fields_alert) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'nlu_settings_alert',
                status: 'critical',
                icon: '',
                content: (data) ? data.mandatory_alert : 'Please fill all the mandatory fields',
                action: {
                    type: 'dismiss'
                }
            }]
        });
        return;
    }

    const recordId = (api.data.general_settings_record.results[0]) ? api.data.general_settings_record.results[0].sys_id.value : null;

    // api.data.nlu_settings.refresh();
    const formData = api.data.nlu_settings.result || {};
    const { value : prevValue } = nlu_driver;
    const { nlu_driver :  { value : currentValue } } = formData;
    if (prevValue != currentValue) {
        api.data.update_sys_prop.execute({
            nlu_driver: (nlu_driver ? nlu_driver.displayValue : null)
        });
    }

    if (!recordId) {
        // create glide record for sys_cs_general_settings
        api.data.create_nlu_settings.execute({
            table: 'sys_cs_general_settings',
            templateFields: fieldValues,
            useSetDisplayValue: null
        });
        api.data.general_settings_record.refresh();
        return;
    }

    // update glide record - sys_cs_general_settings
    api.data.update_nlu_settings.execute({
        table: 'sys_cs_general_settings',
        recordId: recordId,
        templateFields: fieldValues,
        useSetDisplayValue: null
    });

    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            id: 'nlu_settings_alert',
            status: 'info',
            icon: 'info-circle-outline',
            content: (data) ? data.nlu_settings_success : 'NLU settings saved successfully',
            action: {
                    type: 'dismiss'
                }
        }]
    });

     helpers.timing.setTimeout(() => {
        api.emit('NOW_UXF_PAGE#CLEAR_NOTIFICATIONS', {});
    }, 3 * 1000);

}
