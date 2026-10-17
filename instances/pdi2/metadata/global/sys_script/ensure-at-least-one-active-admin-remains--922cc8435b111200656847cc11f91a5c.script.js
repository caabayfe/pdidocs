(function executeRule(current, previous /*null when async*/ ) {

    var sa = new ScopedAdministration();
    if (sa.isScopeAdminRole(current.role) &&
        !sa.canDeleteActiveScopedAdminRespectingAdminMinCountProperty(current.user, current.role)) {
        var adminMinCount = sa.getScopedAdminMinCountIfConfigured(current.role);
        gs.addErrorMessage(gs.getMessage("The role cannot be deleted as it would leave fewer than the configured {0} active application administrators.", [adminMinCount]));
        current.setAbortAction(true);
    } else {
        // the case of current role.contains is scoped admin or not
        var containsScopeAdminRoles = sa.getContainsScopedAdminRoleIDs(current.role);
        for (var i = 0; i < containsScopeAdminRoles.length; i++) {
            var containsScopeAdminRole = containsScopeAdminRoles[i];
            if (!sa.canDeleteActiveScopedAdminRespectingAdminMinCountProperty(current.user, containsScopeAdminRole)) {
                var adminMinCount = sa.getScopedAdminMinCountIfConfigured(containsScopeAdminRole);
                gs.addErrorMessage(gs.getMessage("The role cannot be deleted as it would leave fewer than the configured {0} active application administrators.", [adminMinCount]));
                current.setAbortAction(true);
            }
        }
    }

})(current, previous);
