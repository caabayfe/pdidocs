(function() {
    gs.log("Executing fix script to deactivate domain separation deny unless ACLs on security_attribute table during upgrade");

    if (!GlidePluginManager.isZboot() && GlidePluginManager.isUpgradeSystemBusy()) {
        gs.log("Deactivating domain separation Deny unless UserIsAuthenticated ACLs on upgrade");
        if (!checkIfDataFilterUpgradeHelperAPIExists()) {
            gs.log("Skipping deactivating domain separation deny unless UserIsAuthenticated ACLs as Data Filter Upgrade Helper API does not exist");
            return;
        }

        var skippedIds = deactivateDenyUnlessACLsOnUpgrade();
        if (skippedIds.length == 0) {
            gs.log("Deactivated all domain separation deny unless userIsAuthenticated ACLs on upgrade");
        } else {
            gs.logWarning(gs.getMessage("Skipped sys_ids for domain separation deny unless ACLs deactivation are: {0}", [skippedIds]));
        }
    } else {
        gs.log("Skipping deactivating domain separation deny unless ACLs as instance is not upgrading");
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
        var denyUnlessSysIds = ["0768a8b87f0d12108e6ebdd3dc866552", "1fca79b47f4152108e6ebdd3dc866584", "3885efe07f0912108e6ebdd3dc8665ce",
                              "3ba7a8787f0d12108e6ebdd3dc866547", "3ee720b87f0d12108e6ebdd3dc866550", "4c1a82f47f8152108e6ebdd3dc866584",
                              "5b94aba07f0912108e6ebdd3dc8665e3", "6a7af1b47f4152108e6ebdd3dc8665f7", "6fc90eb47f8152108e6ebdd3dc8665b9",
                              "7005e3e07f0912108e6ebdd3dc8665f5", "8c7e70f07f8d12108e6ebdd3dc8665db", "912875f07f4152108e6ebdd3dc8665bf",
                              "9228e0b87f0d12108e6ebdd3dc8665fa", "985a0af47f8152108e6ebdd3dc8665a8", "9dddbc707f8d12108e6ebdd3dc86658a",
                              "a54bf1f47f4152108e6ebdd3dc866587", "a6887df07f4152108e6ebdd3dc86659a", "a935e7e07f0912108e6ebdd3dc8665a1",
                              "a9ff7c347f8d12108e6ebdd3dc866569", "b55760787f0d12108e6ebdd3dc8665b2", "c29779b07f4152108e6ebdd3dc8665e6",
                              "cecba8bc7f0d12108e6ebdd3dc866558", "cee835347f4152108e6ebdd3dc866554", "d18be0bc7f0d12108e6ebdd3dc8665a8",
                              "f64bac7c7f0d12108e6ebdd3dc86651f", "f8e3eb607f0912108e6ebdd3dc86656e"];
        return new sn_security_upgrade_utils.SlowRolloutUpgradeHelperAPI().deactivateACLsAndFiltersOnUpgrade(denyUnlessSysIds);
    }

})();
