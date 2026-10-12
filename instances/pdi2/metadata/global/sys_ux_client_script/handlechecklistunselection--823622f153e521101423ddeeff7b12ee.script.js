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
    var currList = api.state.selected_mid_servers;
    var item = event.payload.name;
    currList = currList.filter(mid => mid !== item);
    if (currList.length < 5) api.setState('checklist_disabled', false);
    api.setState('selected_mid_servers', currList);
    api.data.mid_server_custom_average_cpu_usage.refresh();
    api.data.mid_server_custom_average_max_memory_usage.refresh();
    api.data.mid_server_custom_lifecycle_event.refresh();
    api.data.mid_server_records_refresh_helper.refresh();
}
