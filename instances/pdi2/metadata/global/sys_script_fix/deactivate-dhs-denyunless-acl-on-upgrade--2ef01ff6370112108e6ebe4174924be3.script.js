(function() {
    gs.log("Executing fix script to deactivate domain high security tables deny ACLs on security_attribute table during upgrade");

    if (!GlidePluginManager.isZboot() && GlidePluginManager.isUpgradeSystemBusy()) {
        gs.log("Deactivating domain high security tables Deny unless UserIsAuthenticated ACLs on upgrade");
        if (!checkIfDataFilterUpgradeHelperAPIExists()) {
            gs.log("Skipping deactivating domain high security tables Deny unless UserIsAuthenticated ACLs as Data Filter Upgrade Helper API does not exist");
            return;
        }

        var skippedIds = deactivateDenyUnlessACLsOnUpgrade();
        if (skippedIds.length == 0) {
            gs.log("Deactivated all domain high security tables deny unless userIsAuthenticated ACLs on upgrade");
        } else {
            gs.logWarning(gs.getMessage("Skipped sys_ids for domain high security tables deny unless ACLs deactivation are: {0}", [skippedIds]));
        }
    } else {
        gs.log("Skipping deactivating domain high security tables Deny unless ACLs as instance is not upgrading");
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
        var denyUnlessSysIds = ["1977dfe07fc512108e6ebdd3dc86652b", "41075fac7f8512108e6ebdd3dc86658c", "91a717247fc512108e6ebdd3dc86657f",
                              "de475be07fc512108e6ebdd3dc86653e", "dfd7d7247fc512108e6ebdd3dc8665e9"];
        return new sn_security_upgrade_utils.SlowRolloutUpgradeHelperAPI().deactivateACLsAndFiltersOnUpgrade(denyUnlessSysIds);
    }

})();
