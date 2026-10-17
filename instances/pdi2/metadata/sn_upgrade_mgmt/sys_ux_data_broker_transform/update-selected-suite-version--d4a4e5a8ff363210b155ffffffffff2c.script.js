function transform(input) {
    try {
        var upgradeSessionId = input.upgradeSessionId;
        var selectedSuiteVersion = input.selectedSuiteVersion;
        // Check upgrade session
        if (!upgradeSessionId || !selectedSuiteVersion) {
            gs.error("Save Post Suite Version: Missing required parameters");
            return {
                status: 400,
                error: "Missing required parameters: upgradeSessionId and selectedSuiteVersion are required"
            };
        }
        
        var postStoreAppsFlowUtil = new sn_upgrade_mgmt.PostStoreAppsFlowUtil();
        
        // Save selected suite version to session
        var success = postStoreAppsFlowUtil.setSelectedSuiteVersionInConfig(
            upgradeSessionId, 
            selectedSuiteVersion
        );
        
        if (success) {
            return {
                status: 200,
                message: "Success",
                savedSuiteVersion: selectedSuiteVersion
            };
        } else {
            gs.error("Save Post Suite Version: Failed to save suite version");
            return {
                status: 500,
                error: "Failed to save suite version"
            };
        }
    } catch (e) {
        gs.error("Save Post Suite Version: Error - " + e.message);
        return {
            status: 500,
            error: e.message
        };
    }
}
