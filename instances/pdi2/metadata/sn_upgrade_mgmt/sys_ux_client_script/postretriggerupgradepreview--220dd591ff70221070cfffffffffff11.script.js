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
    // fetch upgrade preview record with latest execution tracker id
    if (api.state.retryingUpgradePreview ||
        !api.data.look_up_multiple_records_2.results ||
        (api.data.look_up_multiple_records_2.results && api.data.look_up_multiple_records_2.results.length === 0)) {
        if (api.state.totalLookups < 100) {
            helpers.timing.setTimeout(function() {
                api.data.look_up_multiple_records_2.refresh();
                api.setState('totalLookups', api.state.totalLookups + 1);
            }, 500);
        }
    } else {
        // use the above fetched latest upgrade preview record to update previewingVersionSysId
        const data = api.data.look_up_multiple_records_2.results[0];
        api.setState('previewingVersionSysId', data.sys_id.value);
        api.setState('executionTrackerId', data.tracker.value);
        api.setState('totalLookups', 0);
        api.setState('upgradePreviewExecTrackerState', data.tracker._reference.state.value);
        api.setState('upgradePreviewExecTrackerMsg', data.tracker._reference.message.displayValue);

        // update upgrade sessions table with latest values
        helpers.timing.setTimeout(function() {
            api.data.update_upgrade_preview_and_execution_tracker_1.refresh();
        }, 500);
    }
}
