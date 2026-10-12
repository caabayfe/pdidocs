(function executeRule(current, previous /*null when async*/ ) {
    var rmAPI = new SNC.RoleManagementAPI();
    if (!rmAPI.isAllowedToGrantGroup(previous.parent) || !rmAPI.isAllowedToGrantGroup(current.parent)) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('User {0} without security_admin role is not allowed to assign/remove security_admin-containing groups as parent.', gs.getUserDisplayName()));
    }
})(current, previous);
