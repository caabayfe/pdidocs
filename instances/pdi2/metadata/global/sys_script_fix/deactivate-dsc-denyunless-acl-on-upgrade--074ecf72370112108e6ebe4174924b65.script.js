(function() {
    gs.log("Executing fix script to deactivate domain separation center deny ACLs on security_attribute table during upgrade");

    if (!GlidePluginManager.isZboot() && GlidePluginManager.isUpgradeSystemBusy()) {
        gs.log("Deactivating domain separation center Deny unless UserIsAuthenticated ACLs on upgrade");
        if (!checkIfDataFilterUpgradeHelperAPIExists()) {
            gs.log("Skipping deactivating domain separation center Deny unless UserIsAuthenticated ACLs as Data Filter Upgrade Helper API does not exist");
            return;
        }

        var skippedIds = deactivateDenyUnlessACLsOnUpgrade();
        if (skippedIds.length == 0) {
            gs.log("Deactivated all domain separation center deny unless userIsAuthenticated ACLs on upgrade");
        } else {
            gs.logWarning(gs.getMessage("Skipped sys_ids for domain separation center deny unless ACLs deactivation are: {0}", [skippedIds]));
        }
    } else {
        gs.log("Skipping deactivating domain separation center Deny unless ACLs as instance is not upgrading");
    }
        
    function checkIfDataFilterUpgradeHelperAPIExists() {
         try {
            // Check if the API exists in the namespace
            return typeof sn_security_upgrade_utils !== 'undefined' &&
                   sn_security_upgrade_utils.SlowRolloutUpgradeHelperAPI !== undefined;
        } catch (e) {
            return false;
        }
    }

    function deactivateDenyUnlessACLsOnUpgrade() {
        var denyUnlessSysIds = ["0ac932747f0552108e6ebdd3dc866535", "50540f2c7f4512108e6ebdd3dc8665da", "84ea0f247f8512108e6ebdd3dc86654b",
                              "8d5c8fa47f8512108e6ebdd3dc86655c", "ba6bcb647f8512108e6ebdd3dc866533"];
        return new sn_security_upgrade_utils.SlowRolloutUpgradeHelperAPI().deactivateACLsAndFiltersOnUpgrade(denyUnlessSysIds);
    }

})();
