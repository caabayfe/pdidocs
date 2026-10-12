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
    if(api.state.isPostLane === true)
        return;
 
    // console.log("PreFetching data", api.data.look_status_store_tracker_from_playbook.result);

    // populate only on success and treat cancelled as failure
    if (api.data.look_status_store_tracker_from_playbook.result && api.data.look_status_store_tracker_from_playbook.result.state){

        if (api.data.look_status_store_tracker_from_playbook.result.state.value === '2') { // 2 = success
            if (api.state.copyOfstoreUpgradePreviewID !== api.state.storeUpgradePreviewID) {
                api.setState("copyOfstoreUpgradePreviewID", api.state.storeUpgradePreviewID);
            } else {
                api.data.get_app_preview_list_1.refresh();
            }
        // start record watcher if 0 or 1 (pending or running)
        }else if(api.data.look_status_store_tracker_from_playbook.result.state.value === '0' || api.data.look_status_store_tracker_from_playbook.result.state.value === '1') {
            api.data.store_exec_tracker_record_watcher.subscribe({
                table: 'sys_execution_tracker',
                filterConditions: `sys_id=${api.context.props.experienceProperties.store_incoming_apps_exec_tracker.value}`,
                subscribe: true
            });
        }
        api.setState('storeExecTrackerState', api.data.look_status_store_tracker_from_playbook.result.state.value);
    }
     
    
    
}
