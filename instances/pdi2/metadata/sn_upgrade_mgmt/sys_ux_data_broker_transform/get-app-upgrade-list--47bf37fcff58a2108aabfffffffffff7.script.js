function transform(input) {
    var upgrade_plan_sysid = input.upgrade_plan_sysid;
    var upgrade_preview_id = input.upgrade_preview_id;
    var apiUtils = new sn_upgrade_mgmt.PostStoreAppsFlowUtil();
    
    // Get upgrade session ID + session_type from input state or query for active session
    var upgradeSessionId = null;
    var sessionType = null;
    if (input && input.state && input.state.upgrade_session_id) {
        upgradeSessionId = input.state.upgrade_session_id;
        // Resolve session_type so downstream can apply bulk-app-update-specific filters
        var grSessionLookup = new GlideRecord("sn_um_upgrade_sessions");
        if (grSessionLookup.get(upgradeSessionId)) {
            sessionType = grSessionLookup.getValue("session_type");
        }
    } else {
        // Hardened lookup: prefer a session whose upgrade_plan matches the broker input
        // (deterministic — avoids picking the wrong flow when multiple sessions are in_progress).
        // Falls back to most-recent in_progress (existing behavior) if no match.
        var grSession = new GlideRecord("sn_um_upgrade_sessions");
        grSession.addQuery("status", "in_progress");
        if (upgrade_plan_sysid) {
            grSession.addQuery("upgrade_plan", upgrade_plan_sysid);
        }
        grSession.orderByDesc("sys_created_on");
        grSession.setLimit(1);
        grSession.query();
        if (grSession.next()) {
            upgradeSessionId = grSession.getValue("sys_id");
            sessionType = grSession.getValue("session_type");
        } else if (upgrade_plan_sysid) {
            // No session found for this plan — fall back to original loose lookup
            var grFallback = new GlideRecord("sn_um_upgrade_sessions");
            grFallback.addQuery("status", "in_progress");
            grFallback.orderByDesc("sys_created_on");
            grFallback.setLimit(1);
            grFallback.query();
            if (grFallback.next()) {
                upgradeSessionId = grFallback.getValue("sys_id");
                sessionType = grFallback.getValue("session_type");
            }
        }
    }
    
    // Get selected suite version from input state if available
    var selectedSuiteVersion = null;
    if (input && input.state && input.state.selected_suite_version) {
        selectedSuiteVersion = input.state.selected_suite_version;
    }
    
    // Get split apps (golden config and regular)
    var splitResult = apiUtils.getUpgradeAppListWithSplit(
        upgrade_plan_sysid,
        upgrade_preview_id,
        upgradeSessionId,
        selectedSuiteVersion,
        sessionType
    );
    
    // Get all suite versions
    var suiteVersions = splitResult.suiteVersions || [];
    
    // Load suite config maps for ALL versions
    var suiteConfigMaps = {};
    for (var i = 0; i < suiteVersions.length; i++) {
        var suiteVersion = suiteVersions[i];
        var suiteAppsMap = apiUtils._loadSuiteConfigApps(suiteVersion.sys_id, suiteVersion.version);
        suiteConfigMaps[suiteVersion.version] = suiteAppsMap;
    }
    
    // Return structure with both app types and suite metadata
    return {
        goldenConfigApps: splitResult.goldenConfigApps,
        regularApps: splitResult.regularApps,
        allApps: splitResult.allApps, 
        successUpgrades: splitResult.successUpgrades,  
        successNewInstalls: splitResult.successNewInstalls,  
        suiteVersions: splitResult.suiteVersions, 
        suiteConfigMaps: suiteConfigMaps,  
        selectedSuite: splitResult.selectedSuite,  
        latestSuite: splitResult.latestSuite,  
        installedSuite: splitResult.installedSuite  
    };
}
