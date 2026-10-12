/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers }) {
    const data = event.payload?.data || {};
    const changes = data.changes || [];

    if (!changes.includes('state')) return;

    const stateValue = data.record?.state?.value;

    if (stateValue) {
        api.setState('storeExecTrackerState', stateValue);
    }

    // only fetch on success
    if(stateValue === "2") {
        if (api.state.copyOfstoreUpgradePreviewID !== api.state.storeUpgradePreviewID) {
            api.setState("copyOfstoreUpgradePreviewID", api.state.storeUpgradePreviewID);
        } else {
            api.data.get_app_preview_list_1.refresh();
        }
        // Since processing will also start automatically on success - check if it is ongoing
        helpers.timing.setTimeout(() => {
            api.setState("processParams", {
                "upgrade_plan_sysid": api.context.props.experienceProperties.upgrade_plan_sysid.value,
                "upgrade_session_id": api.context.props.experienceProperties.upgrade_session_id.value,
                "first_load": true
            });
        },200);
        
    }

    if (['2','3', '4'].includes(stateValue)) { // unsubscribe on success, failure or cancelled
        api.data.store_exec_tracker_record_watcher.unsubscribe();
    }
}
