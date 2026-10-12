/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    try {
        const data = event.payload.data || {};
        const changes = data.changes || [];

        if (changes.includes('state')) {
            const stateValue = data.record?.state?.value;
            api.setState('upgradePreviewExecutionTrackerState', stateValue);

            // refresh score and table
            if (stateValue === '2') { //0-Pending, 1-Running, 2-Successful, 3-Failed, 4-Cancelled
                api.data.look_up_upgrade_preview.refresh();
            }

            if(stateValue === '2' || stateValue === '3' || stateValue === '4') {
                api.data.upgrade_preview_execution_tracker_record_watcher.unsubscribe();
            }
        }

        if (changes.includes('message') && data.record?.message?.display_value) {
            api.setState('upgradePreviewExecutionTrackerMessage', data.record.message.display_value);
        }
    } catch(error) {
        console.log("Error in executing client script in Preview app upgrade UI: Upgrade preview execution tracker record watcher message received", error);
    }

}
