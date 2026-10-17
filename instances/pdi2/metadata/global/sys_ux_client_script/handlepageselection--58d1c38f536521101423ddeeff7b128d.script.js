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
    api.setState('mid_servers_pagination_offset', event.payload.value * api.state.mid_servers_page_size);
    api.data.mid_server_records_pagination.refresh();
}
