function evaluateProperty({
    api
}) {
    var user_roles = api.context.session.user.roles;
    var admin_roles = ['admin', 'sn_help_setup_admin'];
    var common_roles = user_roles.filter(function(role) {
        return admin_roles.indexOf(role) !== -1;
    });
    if (common_roles.length > 0) {
        return false;
    }
    return true;
}
