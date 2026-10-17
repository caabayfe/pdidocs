/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    try{
        const data = event.payload.data || {};
        const changes = data.changes || [];

        if(changes.includes('upgrade_progress')) {
            const upgradeStateValue = data.record?.upgrade_progress?.value;
            if(upgradeStateValue === "in_progress" || upgradeStateValue === "complete"){
                api.setState("upgradeState", upgradeStateValue);
                api.setState("isPostLane", true);

                api.setState("isProcessingClicked", true);
                api.setState("isProcessing", false);
                api.setState("disableEdit", true);
                // fetch app preview list from preserved table
                api.data.get_preserved_app_list.refresh();

                if(upgradeStateValue === "complete"){
                    api.data.upgrade_state_record_watcher.unsubscribe();
                }
            }
        }
    }catch(error) {
        console.log("Error in executing client script in preivew app upgrade UI: change flow based on upgrade state", error);
    }
}
