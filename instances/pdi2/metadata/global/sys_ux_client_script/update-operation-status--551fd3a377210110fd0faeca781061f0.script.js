/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {   
    if (api.data.get_operation_queue_status_1.output.is_paused)
        api.data.set_operation_queue_status_1.execute({"pause_queue": false});
    else
        api.data.set_operation_queue_status_1.execute({"pause_queue": true});

    api.data.get_operation_queue_status_1.refresh();
}
