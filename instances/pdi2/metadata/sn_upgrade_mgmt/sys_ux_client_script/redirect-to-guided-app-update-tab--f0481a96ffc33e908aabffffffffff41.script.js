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
    var log = function(){}; try { log = imports['sn_upgrade_mgmt.UpgradeManagementUtils']().log; } catch(_e) {}
    try {
        var sessionSysId = null;
        var results = api.data.check_if_bulk_app_update_session_in_progress?.results;
        if (results && results.length > 0) {
            sessionSysId = results[0]?.sys_id?.value;
        }
        if (!sessionSysId && event?.payload?.data?.output?.data?.GlideRecord_Mutation?.insert_sn_um_upgrade_sessions?.sys_id?.value) {
            sessionSysId = event.payload.data.output.data.GlideRecord_Mutation.insert_sn_um_upgrade_sessions.sys_id.value;
        }
        if (sessionSysId) {
            // Refresh bulk session data so isActiveBulkSession state updates
            // This ensures Resume button and alerts show correctly when navigating back
            api.data.check_if_bulk_app_update_session_in_progress?.refresh();

            // Switch tab - same pattern as upgrade's "Redirect to guided tab"
            helpers.timing.setTimeout(function() {
                api.emit("NOW_TABS#SELECTED_ITEM_SET", {
                    "value": "guided_app_update",
                    "item": {
                        "label": "Guided App Update",
                        "order": 20,
                        "route": "guided-app-update",
                        "id": "guided_app_update",
                        "type": "template",
                        "conditional": null
                    }
                });
                // Clear loading state after redirect
                api.setState("isLoading", false);
            }, 300);
        } else {
            // FIX: prefer build identifier (zip filename) for *_id columns; label for *_label
            var buildId = api.state.currentVersionZip || api.state.currentVersion;
            var label   = api.state.currentVersion;
            api.data.bulk_app_update___create_record_1.execute({
                table: "sn_um_upgrade_sessions",
                templateFields: `session_type=bulk_app_update^current_patch_id=${buildId}^current_patch_label=${label}^status=in_progress^target_patch_id=${buildId}^target_patch_label=${label}^environment=${api.state.isProd ? "production" : "sub_production"}`
            });
        }
    } catch (e) {
        log(api, "Redirect to guided app update tab", "Error in Redirect to guided app update tab", e);
    }
}
