/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    try {
        if (api.data.upgrade_preview_execution_tracker.result && api.data.upgrade_preview_execution_tracker.result.upgrade_preview_execution_tracker_store.value != null
        ) {
            const data = api.data.upgrade_preview_execution_tracker.result.upgrade_preview_execution_tracker_store;
            api.setState("upgradePreviewExecutionTracker", data.value);
            api.setState("upgradePreviewExecutionTrackerMessage", data._reference.message.displayValue);
            api.setState("upgradePreviewExecutionTrackerState", data._reference.state.value);

            if(['0', '1'].includes(data._reference.state.value)) {
                api.data.upgrade_preview_execution_tracker_record_watcher.subscribe({
                    table: 'sys_execution_tracker',
                    filterConditions: `sys_id=${data.value}`,
                    subscribe: true
                });
            } else if (data._reference.state.value === '2') {
                api.setState("storeUpgradePreviewID", api.data.upgrade_preview_execution_tracker.result.upgrade_preview_store.value);
                // api.data.look_up_upgrade_session.refresh();
                api.data.look_up_user_lane.refresh();
            }
        } else if(api.data.upgrade_preview_execution_tracker.result && api.data.upgrade_preview_execution_tracker.result.upgrade_preview_execution_tracker_store.value == null){
            api.data.look_up_user_lane.refresh();
        }
    } catch(error) {
        console.log("Error in exeuting client script in App upgrade preview set execution tracker state", error);
    }

}
