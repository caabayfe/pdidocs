(function executeRule(current, previous /*null when async*/ ) {
    var txn = GlideTransaction.get();
    if (!txn)
        return;

    var roleID = txn.getRequestParameter("sysparm_acl_role_pick");
    if (!roleID)
        return;

    new SNC.GlideResourceSupport().createACL("client_callable_script_include", "execute", current.name, roleID);
})(current, previous);
