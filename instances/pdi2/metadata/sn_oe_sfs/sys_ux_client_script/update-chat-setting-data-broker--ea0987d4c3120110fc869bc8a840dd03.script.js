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

    const csFormData = api.state.chat_setup;
    if (!csFormData || !csFormData.sys_id)
        return;

    const recordId = csFormData.sys_id;

    let fieldValues = {
        live_agent_enabled: csFormData.live_agent_enabled.value
    };
    for (const key in csFormData.fields) {
        fieldValues[key] = csFormData.fields[key]?.value;
    }
    api.data.update_chat_settings.execute({
        record_id: recordId,
        field_values: fieldValues

    });

    api.emit('SCREEN_STATUS_CHANGED', {
        isDirty: false
    });

    const {
        trackUsage
    } = imports["sn_oe_sfs.CITelemetry"](api);

    api.state.modifiedFields.forEach(function(dataItem) {
        trackUsage('CI - Frequently modified fields - Chat Setup', {
            fields: dataItem
        });
    });


    api.setState("modifiedFields", []);
}
