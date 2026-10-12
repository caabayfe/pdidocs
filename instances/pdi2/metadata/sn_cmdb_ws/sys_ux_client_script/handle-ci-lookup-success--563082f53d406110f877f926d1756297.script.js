/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const RESULT_TABLE_PRIMARY_CI_MAP = api.data.get_result_table_primary_ci_map.output;

    const {
        table
    } = api.state.queryResultCiLookup;
    
    const {
        column_name: primaryCiColumn,
        class_name: className
    } = RESULT_TABLE_PRIMARY_CI_MAP[table];

    const sysId = api.data.query_result_ci_lookup.output.primaryCiColumn;

    if (sysId && className) {
        helpers.navigate.to('record', { table: className, sysId }, null, null, null, "current");
    }
}
