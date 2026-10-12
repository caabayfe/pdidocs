function transform(input) {
    var apiUtils = new sn_upgrade_mgmt.PostStoreAppsFlowUtil();
    
    // Get upgrade session ID from input state or query for active session
    var upgradeSessionId = null;
    if (input && input.state && input.state.upgrade_session_id) {
        upgradeSessionId = input.state.upgrade_session_id;
    } else {
        // Query for the most recent active upgrade session
        var grSession = new GlideRecord("sn_um_upgrade_sessions");
        grSession.addQuery("status", "in_progress");
        grSession.orderByDesc("sys_created_on");
        grSession.setLimit(1);
        grSession.query();
        if (grSession.next()) {
            upgradeSessionId = grSession.getValue("sys_id");
            gs.info("Found active upgrade session: " + upgradeSessionId);
        }
    }
    
    // Get suite versions - this returns an ARRAY directly
    var suiteVersions = apiUtils._getAvailableSuiteVersions(upgradeSessionId);
    
    gs.info("Suite versions count: " + suiteVersions.length);
    gs.info("Suite versions: " + JSON.stringify(suiteVersions));
    
    // Transform to dropdown format with id and label
    var dropdownItems = [];
    
    if (suiteVersions && suiteVersions.length > 0) {
        dropdownItems = suiteVersions.map(function(suite) {
            return {
                id: suite.version,
                label: suite.version + (suite.installed ? ' (Installed)' : ''),
                installed: suite.installed,
                platform: suite.platform,
                sys_id: suite.sys_id
            };
        });
    }
    
    // Get installed version separately
    var installedVersion = apiUtils._getInstalledSuiteVersion();
    
    // Return result with dropdown items and default selection
    return {
        items: dropdownItems,
        defaultValue: suiteVersions.length > 0 ? suiteVersions[0].version : null,
        installedVersion: installedVersion ? installedVersion.version : null
    };
}
