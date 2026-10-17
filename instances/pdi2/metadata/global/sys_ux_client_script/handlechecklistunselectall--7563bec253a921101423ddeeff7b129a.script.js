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
    var list = new Array();
    api.setState('selected_mid_servers', list);
    api.setState('checklist_disabled', false);
    api.data.mid_server_custom_average_cpu_usage.refresh();
    api.data.mid_server_custom_average_max_memory_usage.refresh();
    api.data.mid_server_custom_lifecycle_event.refresh();
    api.data.mid_server_records_refresh_helper.refresh();
}
