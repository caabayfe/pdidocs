if (!GlidePluginManager.isZboot()) {
    gs.info("Executing fix script to deactivate Deny ACLs on sys_user_group table during upgrade");
    deactivateTableACLsIfPublicAccess();
    deactivateFieldACLIfPublicAccess();
} else {
    gs.info("Skipping deactivating Deny ACLs on sys_user_group table as instance is zbooting");
}

function deactivateTableACLsIfPublicAccess() {
    var tableDenyACLIdOperationMap = {
        "create": "df9b29e2ff3012105229ffffffffffa4",
        "write": "751c2926ff3012105229ffffffffff35",
        "delete": "5aebe126ff3012105229ffffffffffd5",
        "report_view": "89d7f566ff3012105229ffffffffff23"
    };
    var aclRoleGA = new GlideAggregate("sys_security_acl_role");
    aclRoleGA.addQuery("sys_security_acl.name", "sys_user_group");
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
        gs.info("No Table ACLs with public role found for sys_user_group. Skipping deactivation during upgrade.");
        return;
    }

    var aclIdsToDeactivate = operationsWithPublicAccess.map(function getACLId(operation) {
        return tableDenyACLIdOperationMap[operation];
    });

    var api = new sn_security_upgrade_utils.SlowRolloutUpgradeHelperAPI();
    var skippedIds = api.deactivateACLsAndFiltersOnUpgrade(aclIdsToDeactivate);

    if (skippedIds.length == 0) {
        gs.info("Deactivated Deny ACLs with sys_ids on sys_user_group table : " + aclIdsToDeactivate);
    } else {
        gs.info("Skipped deactivation for Deny ACL sys_ids on sys_user_group table during upgrade: " + skippedIds);
    }

}

function deactivateFieldACLIfPublicAccess() {
    var rolesFieldDenyReadACLId = "f8187d66ff3012105229ffffffffff74";
    var aclRoleGA = new GlideAggregate("sys_security_acl_role");
    aclRoleGA.addQuery("sys_security_acl.name", "sys_user_group.roles");
    aclRoleGA.addQuery("sys_security_acl.active", true);
    aclRoleGA.addQuery("sys_security_acl.decision_type", "allow");
    aclRoleGA.addQuery("sys_security_acl.operation.name", "read");
    aclRoleGA.addQuery("sys_security_acl.security_attribute", "!=", "239bdf0c47d23110ba46ff58936d4330")
		.addOrCondition('sys_security_acl.security_attribute', '=', null);
    aclRoleGA.addQuery("sys_user_role.name", "public");
    aclRoleGA.addAggregate("COUNT", "sys_security_acl.operation.name");
    aclRoleGA.query();

    if (!aclRoleGA.next() || aclRoleGA.getAggregate('COUNT', 'sys_security_acl.operation.name') == 0) {
        gs.info("No ACLs with public role found for sys_user_group.roles. Skipping deactivation during upgrade.");
        return;
    }

    var api = new sn_security_upgrade_utils.SlowRolloutUpgradeHelperAPI();
    var skippedIds = api.deactivateACLsAndFiltersOnUpgrade([rolesFieldDenyReadACLId]);
    if (skippedIds.length == 0) {
        gs.info("Deactivated Deny ACLs with sys_id on sys_user_group.roles : " + rolesFieldDenyReadACLId);
    } else {
        gs.info("Skipped deactivation for Deny ACL sys_id on sys_user_group.role table during upgrade: " + skippedIds);
    }
}
