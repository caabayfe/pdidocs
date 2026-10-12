/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var log = function(){}; try { log = imports['sn_upgrade_mgmt.UpgradeManagementUtils']().log; } catch(_e) {}
    try {
        if (api.data.check_if_bulk_app_update_session_in_progress?.results?.length > 0) {
            var sessionSysId = api.data.check_if_bulk_app_update_session_in_progress.results[0]?.sys_id?.value;
            if (sessionSysId) {
                api.emit("UPGRADE_MANAGEMENT_GET_STARTED_VERSION_RELAY_213048839f4012107e91971b8a0a1c90", {
                    bulkPatch: sessionSysId
                });
                api.setState("bulkSessionId", sessionSysId);
            }
        } else {
            api.emit("UPGRADE_MANAGEMENT_GET_STARTED_VERSION_RELAY_213048839f4012107e91971b8a0a1c90", {
                bulkPatch: null
            });
            api.setState("bulkSessionId", '');
        }
        api.data.get_upgrade_details_overview_page?.refresh();
    } catch(e) {
        log(api, "Bulk App Update Create session", "[BulkAppUpdate] Session creation failed", e);
    }
}
