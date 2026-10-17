/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var tableName = api.context.props.table;
    if (tableName == "scan_check" || tableName == "scan_script_only_check" || tableName == "scan_table_check" || tableName == "scan_column_type_check") {
        return false;
    } else {
        return true;
    }
}
