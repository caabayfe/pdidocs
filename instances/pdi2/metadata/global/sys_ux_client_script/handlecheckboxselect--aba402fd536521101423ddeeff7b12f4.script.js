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
    var currSelectedList = api.state.selected_mid_servers;
    var currSelectedCheckboxes = api.state.selected_mid_server_checkboxes;
    var item = event.payload.name;
    currSelectedList.push(item);
    currSelectedCheckboxes.push(item);
    for (var mid of api.state.mid_servers_pagination) {
        list.push(mid.name.value);
    }
    if (currSelectedList.length >= 5) api.setState('checklist_disabled', true);
    api.setState('mid_server_checkboxes', list);
    api.setState('selected_mid_servers', currSelectedList);
    api.setState('selected_mid_servers_checkboxes', currSelectedCheckboxes);
    api.data.mid_server_custom_average_cpu_usage.refresh();
    api.data.mid_server_custom_average_max_memory_usage.refresh();
    api.data.mid_server_custom_lifecycle_event.refresh();
}
