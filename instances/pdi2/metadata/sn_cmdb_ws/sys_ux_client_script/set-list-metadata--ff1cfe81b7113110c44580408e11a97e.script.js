/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const tableName = api.data.get_task_to_ci_table_name.output;
    if (tableName) {
        api.setState("listTable", tableName);
        api.setState("listFixedFilter", "cmdb_data_management_task=" + api.context.props.sysId);
    }
}
