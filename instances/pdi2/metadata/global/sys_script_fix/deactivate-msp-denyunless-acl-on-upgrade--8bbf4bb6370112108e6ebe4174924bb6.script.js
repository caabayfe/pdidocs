(function() {
    gs.log("Executing fix script to deactivate domain msp extensions deny ACLs on security_attribute table during upgrade");

    if (!GlidePluginManager.isZboot() && GlidePluginManager.isUpgradeSystemBusy()) {
        gs.log("Deactivating domain msp extensions Deny unless UserIsAuthenticated ACLs on upgrade");
        if (!checkIfDataFilterUpgradeHelperAPIExists()) {
            gs.log("Skipping deactivating domain msp extensions Deny unless UserIsAuthenticated ACLs as Data Filter Upgrade Helper API does not exist");
	        return;
        }

        var skippedIds = deactivateDenyUnlessACLsOnUpgrade();
        if (skippedIds.length == 0) {
            gs.log("Deactivated all domain msp extensions deny unless userIsAuthenticated ACLs on upgrade");
        } else {
            gs.logWarning(gs.getMessage("Skipped sys_ids for domain msp extensions deny unless ACLs deactivation are: {0}", [skippedIds]));
        }
    } else {
        gs.log("Skipping deactivating domain msp extensions Deny unless ACLs as instance is not upgrading");
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
        var denyUnlessSysIds = ["03905fe87f8512108e6ebdd3dc8665fc", "21f19b6c7f8512108e6ebdd3dc86654e", "22ca1e207fc112108e6ebdd3dc866577",
                              "50ef4fa87f8512108e6ebdd3dc86651b", "67f7966c7f8112108e6ebdd3dc86651b", "7f5ad2207fc112108e6ebdd3dc86653d",
                              "ae3097e87f8512108e6ebdd3dc866508", "aee99aec7f8112108e6ebdd3dc86657f", "c001572c7f8512108e6ebdd3dc866565", "e613dee47f8112108e6ebdd3dc866548"];
        return new sn_security_upgrade_utils.SlowRolloutUpgradeHelperAPI().deactivateACLsAndFiltersOnUpgrade(denyUnlessSysIds);
    }

})();
