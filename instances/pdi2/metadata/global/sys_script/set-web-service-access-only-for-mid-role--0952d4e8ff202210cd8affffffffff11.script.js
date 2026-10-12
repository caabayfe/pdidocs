(function executeRule(current, previous) {
    var roleGr = new GlideRecord('sys_user_role');
    if (!roleGr.get(current.role)) {
        return;
    }

    // Only proceed if this is the mid_server role
    if (roleGr.sys_name != 'mid_server') {
        return;
    }

    // Get the user record
    var user = new GlideRecord('sys_user');
    if (!user.get(current.user)) {
        return;
    }

    if (current.operation() === 'insert') {
        // Mid server role is being added
        user.web_service_access_only = true;
        user.update();
        if (gs.isInteractive())
            gs.addInfoMessage(gs.getMessage("Web Service Access Only for MID Server Role"));
		
    } else if (current.operation() === 'delete') {
        // Check if the user still has any mid_server role assignments
        var hasOtherMidServerRole = false;
        var checkRoles = new GlideRecord('sys_user_has_role');
        checkRoles.addQuery('user', current.user);
        checkRoles.addQuery('role', current.role);
        // Don't count the current record that's being deleted
        checkRoles.addQuery('sys_id', '!=', current.sys_id);
        checkRoles.query();
        hasOtherMidServerRole = checkRoles.hasNext();

        if (!hasOtherMidServerRole) {
            // No other mid_server role assignments, disable the flag
            user.web_service_access_only = false;
            user.update();
        }
    }
})(current, previous);
