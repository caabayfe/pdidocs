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
    const response = api.data.validate_data_management_task_record.output;
    const {
        validateTaskRecord
    } = imports["sn_cmdb_ws.CMDBWsDMTaskUtil"]();
    validateTaskRecord(response, api);
}
