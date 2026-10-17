/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.data.instance_scan_queue_status_1.output.is_paused)
        api.data.set_instancescan_queue_status.execute({"pause_queue": false});
    else
        api.data.set_instancescan_queue_status.execute({"pause_queue": true});

    api.data.instance_scan_queue_status_1.refresh();
}
