/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if(!(api.data.load_rule_details.output && api.data.load_rule_details.output.rule)) return [];
    if(!(api.data.dmc_rule_app_context.output && api.data.dmc_rule_app_context.output.tableMetadata)) return [];
    var name = api.data.load_rule_details.output.rule.name;

    var allTablesStr = helpers.translateSync("All tables");
    var tableLabel = api.data.dmc_rule_app_context.output.tableMetadata.label || api.context.props.tableName;
    return `[{\"label\":\"${allTablesStr}\",\"href\":\"javascript:void(0)\"},{\"label\":\"${tableLabel}\",\"href\":\"javascript:void(0)\"},{\"label\":\"${name}\",\"href\":\"#\"}]`;
}
