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
    var startD = event.payload.start.split(" ")[0].replace(/-/gi, ":");
    var startT = event.payload.start.split(" ")[1];
    var endD = event.payload.end.split(" ")[0].replace(/-/gi, ":");
    var endT = event.payload.end.split(" ")[1];
    var selectedD = "javascript:gs.dateGenerate('" + startD + "','" + startT + "')@javascript:gs.dateGenerate('" + endD + "','" + endT + "')";
    api.setState('picker_selected_date', selectedD);
    api.data.mid_server_custom_average_cpu_usage.refresh();
    api.data.mid_server_custom_average_max_memory_usage.refresh();
    api.data.mid_server_custom_lifecycle_event.refresh();
}
