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
    var listSelected = api.state.selected_mid_servers.map(mid => mid);
    api.setState('selected_mid_server_checkboxes', listSelected);
}
