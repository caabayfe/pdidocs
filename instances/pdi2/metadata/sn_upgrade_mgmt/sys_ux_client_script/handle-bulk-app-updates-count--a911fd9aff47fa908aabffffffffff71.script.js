/**
 * @param {object} params
 * @param {object} params.api
 * @param {object} params.helpers
 */
function handler({ api, helpers, imports }) {
    var log = function(){}; try { log = imports['sn_upgrade_mgmt.UpgradeManagementUtils']().log; } catch(_e) {}
    try {
        var responseData = api?.data?.get_bulk_app_update_counts?.output;
        if (responseData) {
            api.setState("kpiCounts", {
                "totalAppsWithUpdates": responseData.totalAppsWithUpdates || 0,
                "storeAppsCount": responseData.storeAppsCount || 0,
                "nowAssistAppsCount": responseData.nowAssistAppsCount || 0
            });
        }
        api.setState("isLoading", false);
    } catch(e) {
        log(api, "Handle Bulk App Updates Count", "Error in client script", e);
        api.setState("isLoading", false);
    }
}
