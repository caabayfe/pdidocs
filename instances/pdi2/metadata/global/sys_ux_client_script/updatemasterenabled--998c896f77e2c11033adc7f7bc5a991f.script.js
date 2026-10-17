/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.data.look_up_enabled.result.length == 0) {
        api.data.create_record.execute({
            table: 'sys_properties',
            templateFields: "name=com.glide.security.protected_table.enabled^type=boolean^value=true^write_roles=security_admin^read_roles=admin,security_admin^ignore_cache=true",
            useSetDisplayValue: false
        });
    } else {
        api.data.update_record.execute({
            table: 'sys_properties',
            recordId: api.data.look_up_enabled.result._row_data.uniqueValue,
            templateFields: "value=true",
            useSetDisplayValue: false
        });
    }

    api.setState('masterEnabled', true);
}
