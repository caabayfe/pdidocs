/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const changes = event.payload?.data?.changes || false;
    if (Array.isArray(changes) && changes.length) {
        api.data.get_predicted_skipped_records_count_1.refresh();
        api.data.upgrade_management___get_predicted_skipped_records_1.refresh();
        api.data.look_up_multiple_records_3.refresh();
    }
}
