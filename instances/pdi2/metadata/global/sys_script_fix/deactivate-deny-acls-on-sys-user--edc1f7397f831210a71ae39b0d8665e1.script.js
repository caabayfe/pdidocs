if (!GlidePluginManager.isZboot()) {
    gs.info("Executing fix script to deactivate Deny ACLs on sys_user table during upgrade");
    deactivateTableACLsIfPublicAccess();
} else {
    gs.info("Skipping deactivating Deny ACLs on sys_user table as instance is zbooting");
}

function deactivateTableACLsIfPublicAccess() {
    var tableDenyACLIdOperationMap = {
        "create": "190c1cc0373012105229f8ac24924b55",
        "delete": "de6c5404373012105229f8ac24924b49"
    };
    var aclRoleGA = new GlideAggregate("sys_security_acl_role");
    aclRoleGA.addQuery("sys_security_acl.name", "sys_user");
    aclRoleGA.addQuery("sys_security_acl.active", true);
    aclRoleGA.addQuery("sys_security_acl.decision_type", "allow");
    aclRoleGA.addQuery("sys_security_acl.operation.name", "IN", Object.keys(tableDenyACLIdOperationMap).join());
    aclRoleGA.addQuery("sys_security_acl.security_attribute", "!=", "239bdf0c47d23110ba46ff58936d4330")
        .addOrCondition('sys_security_acl.security_attribute', '=', null);
    aclRoleGA.addQuery("sys_user_role.name", "public");
    aclRoleGA.addAggregate("COUNT", "sys_security_acl.operation.name");
    aclRoleGA.query();

    var operationsWithPublicAccess = [];

    while (aclRoleGA.next()) {
        var operationCount = aclRoleGA.getAggregate('COUNT', 'sys_security_acl.operation.name');
        var operation = aclRoleGA.getValue('sys_security_acl.operation.name');
        if (operationCount > 0) {
            operationsWithPublicAccess.push(operation);
        }
    }

    if (operationsWithPublicAccess.length == 0) {
        gs.info("No Table ACLs with public role found for sys_user. Skipping deactivation during upgrade.");
        return;
    }

    var aclIdsToDeactivate = operationsWithPublicAccess.map(function getACLId(operation) {
        return tableDenyACLIdOperationMap[operation];
    });

    var api = new sn_security_upgrade_utils.SlowRolloutUpgradeHelperAPI();
    var skippedIds = api.deactivateACLsAndFiltersOnUpgrade(aclIdsToDeactivate);

    if (skippedIds.length == 0) {
        gs.info("Deactivated Deny ACLs with sys_ids on sys_user table : " + aclIdsToDeactivate);
    } else {
        gs.info("Skipped deactivation for Deny ACL sys_ids on sys_user table during upgrade: " + skippedIds);
    }

}
