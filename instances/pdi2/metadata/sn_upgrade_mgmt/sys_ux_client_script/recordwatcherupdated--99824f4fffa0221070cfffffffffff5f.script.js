/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const data = event.payload.data || {};
    const changes = data.changes || [];

    if (changes.includes('state')) {
        const stateValue = data.record?.state?.value;
        api.setState('upgradePreviewExecTrackerState', stateValue);

        // refresh score and table
        if (stateValue !== '0' && stateValue !== '1') { //0-Pending, 1-Running, 2-Successful, 3-Failed, 4-Cancelled
            api.data.get_predicted_skipped_records_count_1.refresh();
            api.data.upgrade_management___get_predicted_skipped_records_1.refresh();
            api.data.aggregation_query_1.refresh();
            api.data.look_up_multiple_records_3.refresh();
            api.data.look_up_generate_preview_requested.refresh();
        }
    }

    if (changes.includes('message') && data.record?.message?.display_value) {
        api.setState('upgradePreviewExecTrackerMsg', data.record.message.display_value);
    }

}
