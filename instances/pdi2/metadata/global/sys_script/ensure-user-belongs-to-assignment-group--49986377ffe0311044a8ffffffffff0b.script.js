(function executeRule(current, previous /*null when async*/ ) {
    var isAssignmentGroupSupportEnabled = new ConnectorInstanceUtil().isAssignmentGroupSupportEnabled();

    if (!isAssignmentGroupSupportEnabled) {
        // While the assignment group should not change as we render the field read-only when support is disabled,
        // we add an additional check to ensure that assignment group does not change.
        if (current.assignment_group.changes()) {
            gs.addErrorMessage(gs.getMessage(gs.getMessage("Assignment group modification is disabled when assignment group support is turned off.")));
            current.setAbortAction(true);
        }
        return;
    }

    var currentUser = gs.getUser();
    var adminRoles = new ConnectorInstanceUtil().getAssignmentGroupAdminRoles().trim().split(',');

    // Check if current user has mid server role 
    // (MID Server user does not have access to em_connector_instance table but it will be used in Test Connection which updates last_status and metrics status fields)
    if (currentUser.hasRole('mid_server')) {
        return;
    }

    // Check if the current user has any of the admin roles
    for (var i = 0; i < adminRoles.length; i++) {
        if (currentUser.hasRole(adminRoles[i])) {
            // User is admin. Assignment group can be NONE or one of the available groups as per sys_user_group ACL
            return;
        }
    }

    var userGroup = current.assignment_group;

    // non-admin user cannot set an empty assignment group
    if (!userGroup) {
        gs.addErrorMessage(gs.getMessage("Assignment group is not specified."));
        current.setAbortAction(true);
        return;
    }

    // Check if the current user is a member or of the required sys_user_group
    // NOTE: User can be MEMBER, MANAGER or BOTH for a group
    var userIsMemberOrManager = new ConnectorInstanceUtil().isCurrentUserMemberOrManagerOfGroup(userGroup);

    // If the user is not a member/manager, prevent the insertion
    // This is a fail-safe in case user disables the reference qualifier. In which case, user can see all the groups.
    // We abort if user selects a group that the user is not part of or is not the manager of.
    if (!userIsMemberOrManager) {
        gs.addErrorMessage(gs.getMessage("You do not have access to the selected assignment group"));
        current.setAbortAction(true);
    }
})(current, previous);
