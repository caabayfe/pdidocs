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
    var appIdInput = api.state.appId;
    var sysId = api.data.look_up_record_1.result._row_data.uniqueValue;

    if (api.data.look_up_record_1.result.sys_scope._reference.name.value != api.data.sso_status_1.output.scope) {
        var message = 'App ID record is in ' + api.data.look_up_record_1.result.sys_scope._reference.name.value +
            ' scope. Current scope is ' + api.data.sso_status_1.output.scope + '. Please switch to ' +
            api.data.look_up_record_1.result.sys_scope._reference.name.value + ' scope to update the App ID.';

        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'scope_mismatch_alert',
                status: 'info',
                icon: 'info-circle-outline',
                content: message,
                action: {
                    type: 'dismiss'
                }
            }]
        });
        return;
    }

    api.data.update_record_1.execute({
        table: "sys_cs_custom_adapter_property",
        recordId: sysId,
        templateFields: "value=" + appIdInput
    });
}
