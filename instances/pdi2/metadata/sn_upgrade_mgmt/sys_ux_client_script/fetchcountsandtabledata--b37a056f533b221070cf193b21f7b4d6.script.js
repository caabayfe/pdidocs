/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const result = api.data.get_latest_upgrade_preview_and_execution_tracker.results?.[0] || {};

    api.setState('sessionType', result.session_type.value);
    api.setState('previewingVersionSysId', result.upgrade_preview.value);
    api.setState('executionTrackerId', result.upgrade_preview_execution_tracker.value);
    api.setState('upgradePreviewExecTrackerState', result.upgrade_preview_execution_tracker._reference.state.value);
    api.setState('upgradePreviewExecTrackerMsg', result.upgrade_preview_execution_tracker._reference.message.displayValue);

    const execTrackerState = result.upgrade_preview_execution_tracker._reference.state.value;
    if (execTrackerState !== '0' && execTrackerState !== '1') {
        api.data.get_predicted_skipped_records_count_1.refresh();
        api.data.upgrade_management___get_predicted_skipped_records_1.refresh();
        api.data.aggregation_query_1.refresh();
        api.data.look_up_multiple_records_3.refresh();
    }
}
