(function executeRule(current, previous) {
    gs.info('Disable RBAC on global access control: global access control disabled, ' +
        'setting is_rbac_enabled=false on all auth_server_connection records.');
    try {
        var rbacClient = new sn_auth.GlideRBACClient();
        rbacClient.onGlobalAccessControlDisabled();
        gs.info('Disable RBAC on global access control: completed successfully.');
    } catch (e) {
        gs.error('Disable RBAC on global access control: failed: ' + e.message);
    }
})(current, previous);
