(function executeRule(current, previous /*null when async*/ ) {
    var roles = current.run_with_roles.toString() || '';
    var sa = new ScopedAdministration();

    current.run_with_roles = roles
        .split(',')
        .map(role => role.trim())
        .filter(role => !sa.isScopeAdminRole(role))
        .join(',');
})(current, previous);
