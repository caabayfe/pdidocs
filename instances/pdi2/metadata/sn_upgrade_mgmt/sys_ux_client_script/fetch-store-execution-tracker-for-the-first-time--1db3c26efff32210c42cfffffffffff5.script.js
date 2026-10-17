/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
        if(api.data.look_up_upgrade_session.results[0]) {
            var tracker = api.data.look_up_upgrade_session.results[0].store_incoming_apps_exec_tracker;
            var trackerSysId = tracker && tracker.value;
            api.setState("storeIncomingExecTracker", trackerSysId);
            if(trackerSysId) {
                api.data.look_status_store_tracker_from_playbook.refresh();
            }
        }
}
