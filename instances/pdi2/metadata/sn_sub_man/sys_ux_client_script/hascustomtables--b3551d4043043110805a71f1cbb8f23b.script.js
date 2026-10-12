/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const hasCustomTablesRecords = api.data.has_custom_tables.output.data.GlideRecord_Query.ua_custom_table_inventory._rowCount !== 0;
    api.setState('isDynamicTabsLoading', true);
    api.setState('hasCustomTablesRecords', hasCustomTablesRecords);
}
