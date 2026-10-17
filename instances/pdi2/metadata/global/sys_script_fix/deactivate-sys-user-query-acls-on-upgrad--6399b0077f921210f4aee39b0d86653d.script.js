if (!GlidePluginManager.isZboot()) {
    gs.info("Executing fix script to deactivate Query ACLs on sys_user table during upgrade");
    var queryACLSysIds = ["5120a4877f121210f4aee39b0d866545", "6d9d24877f521210f4aee39b0d866551", "20ad28877f521210f4aee39b0d86658e", "79ada8877f521210f4aee39b0d86650b"];
    var api = new sn_security_upgrade_utils.SlowRolloutUpgradeHelperAPI();
    var skippedIds = api.deactivateACLsAndFiltersOnUpgrade(queryACLSysIds);
    if (skippedIds.length == 0) {
        gs.info("Deactivated Query ACLs with all listed sys_ids on sys_user table");
    } else {
        gs.info("Skipped deactivation for Query ACL sys_ids on sys_user table during upgrade: " + skippedIds);
    }
} else {
    gs.info("Skipping deactivating Query ACLs on sys_user table as instance is zbooting");
}
