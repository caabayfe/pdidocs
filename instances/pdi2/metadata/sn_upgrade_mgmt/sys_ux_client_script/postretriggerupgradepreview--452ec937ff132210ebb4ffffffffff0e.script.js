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
    try {
        // fetch upgrade preview record with latest execution tracker id
        if (!api.data.query_upgrade_preview.results ||
            (api.data.query_upgrade_preview.results && api.data.query_upgrade_preview.results.length === 0) || !(api.data.query_upgrade_preview.results[0]._row_data.uniqueValue)) {
            
            const maxAttempts = 120; // Adjusted for 5-20 minute operations + 10 minute buffer
            const currentAttempt = api.state.upgradePreviewTotalLookups || 0;

            if (currentAttempt < maxAttempts) {
                // Tiered polling strategy for long-running operations (5-20 mins + 10min buffer)
                let delay;
                if (currentAttempt < 10) {
                    // First 10 attempts: 2 seconds (quick initial checks - 20s total)
                    delay = 2000; 
                } else if (currentAttempt < 25) {
                    // Next 15 attempts: 5 seconds (1 min 15s total)
                    delay = 5000;
                } else if (currentAttempt < 50) {
                    // Next 25 attempts: 10 seconds (4 min 10s total)
                    delay = 10000;
                } else if (currentAttempt < 80) {
                    // Next 30 attempts: 15 seconds (7 min 30s total)
                    delay = 15000;
                } else {
                    // Final 40 attempts: 15 seconds (10 min buffer)
                    delay = 15000;
                }
                // Total coverage: ~35 minutes with 10-minute buffer
                
                helpers.timing.setTimeout(function() {
                    api.data.query_upgrade_preview.refresh();
                    api.setState('upgradePreviewTotalLookups', currentAttempt + 1);
                }, delay);
            }
        } else {
            // use the above fetched latest upgrade preview record to update previewingVersionSysId
            const data = api.data.query_upgrade_preview.results[0];
            api.setState('storeUpgradePreviewID', data._row_data.uniqueValue);
            api.setState('upgradePreviewTotalLookups', 0);

            // update upgrade sessions table with latest values
            helpers.timing.setTimeout(function() {
                api.data.update_upgrade_preview_and_execution_tracker_in_upgrade_session_table.refresh();
            }, 500);
        }
    } catch(error) {
        console.log("Error in executing client script in App upgrade preview UI postReTriggerUpgradePreview", error);
    }
}
