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
        table,
        sys_id
    } = event.payload;

    if (RESULT_TABLE_PRIMARY_CI_MAP.hasOwnProperty(table)) {
        let primaryCiColumn = RESULT_TABLE_PRIMARY_CI_MAP[table].column_name;
        // Updating this state will trigger the data broker
        api.setState('queryResultCiLookup', {
            table,
            recordId: sys_id,
            returnFields: primaryCiColumn
        });
    } else {
        helpers.navigate.to('record', { table, sysId: sys_id }, null, null, null, "current");
    }
}
