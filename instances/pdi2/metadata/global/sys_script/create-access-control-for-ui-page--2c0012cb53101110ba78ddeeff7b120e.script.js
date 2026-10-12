(function executeRule(current, previous /*null when async*/ ) {
    var txn = GlideTransaction.get();
    if (!txn)
        return;

    var roleID = txn.getRequestParameter("sysparm_acl_role_pick");
    if (!roleID)
        return;

    var uiPageName = current.sys_package.scope + '_' + current.name;
    if (current.sys_scope == 'global')
        uiPageName = current.name;

    new SNC.GlideResourceSupport().createACL("ui_page", "read", uiPageName, roleID);
})(current, previous);
