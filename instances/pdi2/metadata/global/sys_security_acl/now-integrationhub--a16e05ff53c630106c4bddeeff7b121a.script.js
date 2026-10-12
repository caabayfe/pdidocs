function isDDUserWithIntegrationPermission() {
    var currentUser = gs.getUser();
    var roles = (currentUser.getUserRoles() + "").split(",");
    var integrationDDRoleMatcher = new RegExp('^sn_dd_[a-z0-9_-]+_(integrations|delegatedadmin)(_rc_\\d+)?$');
    return roles.some(function(role) {
        return integrationDDRoleMatcher.test(role);
    });
}
answer = isDDUserWithIntegrationPermission();
