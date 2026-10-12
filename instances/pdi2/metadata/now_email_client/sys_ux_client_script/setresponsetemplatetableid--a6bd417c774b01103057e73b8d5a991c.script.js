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
    const templateConfig = api.data.gliderecord_collection_query_1.output.data.GlideRecord_Query.cxs_table_config._results[0];
    if(templateConfig) {
      api.setState("responseTemplateTableId", templateConfig._row_data.uniqueValue);
    }
}
