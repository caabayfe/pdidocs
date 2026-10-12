gs.info("Execute fix script to deactivate deny acls on sys_security_attribute table during upgrade");
if (!GlidePluginManager.isZboot()) {
    var securityAttributeSysIds = ["2bdebf109f8112108647e8c40b0a1c74", "683f37509f8112108647e8c40b0a1cae", "7d9ffb509f8112108647e8c40b0a1ce8", "999affd89f4112108647e8c40b0a1c65", "ee3ebfdc9f4112108647e8c40b0a1cb0"];
    var api = new sn_security_upgrade_utils.SlowRolloutUpgradeHelperAPI();
    var skippedIds = api.deactivateACLsAndFiltersOnUpgrade(securityAttributeSysIds);
    if (skippedIds.length == 0) {
        gs.info("Fix script to deactivate deny acls on sys_security_attribute table during upgrade, deactivated all listed sysIds");
    } else {
        gs.warn("Skipped denyacl sys_ids on sys_security_attribute table from deactivation during upgrade are: " + skippedIds);
    }
}
