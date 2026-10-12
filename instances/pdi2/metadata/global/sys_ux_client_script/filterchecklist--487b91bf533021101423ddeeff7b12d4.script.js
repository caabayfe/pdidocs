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
    api.setState('search_query', 'nameSTARTSWITH' + event.payload.fieldValue);
    api.data.mid_server_records_pagination.refresh();
    api.data.mid_server_count.refresh();
    api.data.mid_server_records_refresh_helper.refresh();
}
