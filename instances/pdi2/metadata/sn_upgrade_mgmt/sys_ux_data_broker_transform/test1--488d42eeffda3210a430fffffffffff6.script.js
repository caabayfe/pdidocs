function transform(input) {
    try {
        var gcRowData = input.gcRowData;
        var upgradePlanSysId = input.upgradePlanSysId;
        var upgradeSessionId = input.upgradeSessionId;
        var selectedSuiteVersion = input.selectedSuiteVersion;
        
        if (!gcRowData || !upgradePlanSysId) {
            gs.error("Update GC App Versions: Missing required parameters");
            return {
                status: 400,
                error: "Missing required parameters: gcRowData and upgradePlanSysId are required"
            };
        }
        
        var storeAppsFlowUtils = new sn_upgrade_mgmt.StoreAppsFlowUtils();
        
        // Save selected suite version to session if provided
        if (upgradeSessionId && selectedSuiteVersion) {
            storeAppsFlowUtils.setSelectedSuiteVersionInConfig(upgradeSessionId, selectedSuiteVersion);
        }
        
        // Update golden config apps in upgrade plan
        var result = storeAppsFlowUtils.persistGoldenConfigAppsFromRowData(
            gcRowData,
            upgradePlanSysId,
			selectedSuiteVersion
        );
        
        if (result.success) {
            return {
                status: 200,
                message: "Success",
                inserted: result.inserted,
                updated: result.updated
            };
        } else {
            gs.error("Update GC App Versions: Failed to update - " + result.error);
            return {
                status: 500,
                error: result.error
            };
        }
    } catch (e) {
        gs.error("Update GC App Versions: Error - " + e.message);
        return {
            status: 500,
            error: e.message
        };
    }
}
