function onLoad() {
	// If assignment group is not supported. Set the field as not-mandatory so that it can be hidden from the form
    if (g_scratchpad.assignmentGroupSupportEnabled != 'true') {
        g_form.setMandatory('assignment_group', false);
        return;
    }

    var currentUserRoles = g_user.getRoles();

	// adminRoles will never be empty and have default of admin,evt_mgmt_admin even if the corresponding property does not exist.
    var adminRoles = g_scratchpad.assignmentGroupAdminRoles.trim().split(',');

    // Check if the current user has any of the admin roles
    var hasAdminRole = false;
    for (var i = 0; i < adminRoles.length; i++) {
        if (currentUserRoles.includes(adminRoles[i])) {
            hasAdminRole = true;
            break;
        }
    }

    // Set 'assignment_group' field mandatory if the user has a mandatory role
    // The field is mandatory for all non-admin roles
    if (hasAdminRole) {
        g_form.setMandatory('assignment_group', false);
    } else {
        g_form.setMandatory('assignment_group', true);
    }
}
