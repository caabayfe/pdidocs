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
    if(api.context.props.table == "scan_check_suite"){
        api.setState("suiteId", api.context.props.sysId);
    } else if(api.context.props.table == "scan_script_only_check" || api.context.props.table == "scan_table_check"){
        api.setState("checkId", api.context.props.sysId);
        api.setState("tableName", api.context.props.table);
    }  
}
