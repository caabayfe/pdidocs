/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let activityState = api.context.props.activityState.value;
    let isPostUpgrade = api.data.look_up_user_lane.results[0].is_post_lane.value;
    let upgradeState = api.data.look_up_user_lane.results[0].upgrade_progress.value;
    let sessionType = api.context.props.experienceProperties.session_type?.value;

    // For bulk_app_update: is_post_lane from DB may be stale from a prior sys_upgrade session.
    // Only trust upgradeState (from the current session) to determine isPostLane. DEF0829256
    if (sessionType === 'bulk_app_update') {
        isPostUpgrade = false;
    }

    if(activityState === undefined)
        activityState = "IN_PROGRESS"; // in UIB activityState comes as undefined

    if(sessionType !== 'bulk_app_update' && upgradeState && (upgradeState === "in_progress" || upgradeState === "complete")){
        isPostUpgrade = true;
    }else{
        api.data.upgrade_state_record_watcher.subscribe({
            table: 'sn_um_upgrade_sessions',
            filterConditions: `sys_id=${api.context.props.experienceProperties.upgrade_session_id.value}`,
            subscribe: true
        });
    }

    api.setState("activityState", activityState);
    api.setState("isPostLane", isPostUpgrade);
    api.setState("upgradeState", upgradeState);

    
    if(isPostUpgrade === false) {

        api.data.look_up_upgrade_session.refresh(); 
        // success of this will check if processing(comp check) happened -> if yes, trigger getPreviewList
        // TODO: Only trigger on running - more discussion required
        // success of this will also check if store API is running -> wait for completion -> trigger getPreviewList

        if(activityState !== 'IN_PROGRESS'){
            api.setState("disableEdit", false);
            api.setState("isProcessing", false);
       } else
            api.setState("disableEdit", true);
    }else {
        api.setState("isProcessingClicked", true);
        api.setState("isProcessing", false);
        api.setState("disableEdit", true);
        // fetch app preview list from preserved table
        api.data.get_preserved_app_list.refresh();
    }
}
