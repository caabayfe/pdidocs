(function executeRule(current, previous) {
    var sa = new ScopedAdministration();
    var roleToAdminCountMap = sa.countNumberOfActiveScopeAdminIfGroupMemberRemoved(current.user, current.group);
    var scopedAdminRolesForGroup = Object.keys(roleToAdminCountMap);

    if (scopedAdminRolesForGroup.length == 0)
        return;

    for (var i = 0; i < scopedAdminRolesForGroup.length; i++) {
        var role = scopedAdminRolesForGroup[i];
        var minAdminCount = roleToAdminCountMap[role].minAdminCount;
        var remainingAdminCount = roleToAdminCountMap[role].remainingAdminCount;
        if (remainingAdminCount < minAdminCount) {
            gs.addErrorMessage(gs.getMessage("The member cannot be removed as it would leave fewer than the configured active application administrators."));
            current.setAbortAction(true);
            break;
        }
    }

})(current, previous);
