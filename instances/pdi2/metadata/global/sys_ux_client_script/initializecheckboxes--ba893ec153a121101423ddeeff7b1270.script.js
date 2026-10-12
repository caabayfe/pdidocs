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
    var list = api.data.mid_server_records_pagination.results.map(mid => mid.name.value);
    api.setState('mid_server_checkboxes', list);
}
