gs.info("Execute fix script to deactivate deny acls with roles on sys_security_data_filter table during upgrade");
if (!GlidePluginManager.isZboot()) {
    var securityDatafilterSysIds = ["73b140649f8112108647e8c40b0a1c5e", "a772cc649f8112108647e8c40b0a1c73", "d9c288a49f8112108647e8c40b0a1c27", "e2efb3909f8112108647e8c40b0a1c48", "f73288649f8112108647e8c40b0a1c6f"];
    var api = new sn_security_upgrade_utils.SlowRolloutUpgradeHelperAPI();
    var skippedIds = api.deactivateACLsAndFiltersOnUpgrade(securityDatafilterSysIds);
    if (skippedIds.length == 0) {
        gs.info("Fix script to deactivate deny acls on sys_security_data_filter table during upgrade, deactivated all listed sysIds");
    } else {
        gs.warn("Skipped denyacl sys_ids on sys_security_data_filter table from deactivation during upgrade are: " + skippedIds);
    }
}
