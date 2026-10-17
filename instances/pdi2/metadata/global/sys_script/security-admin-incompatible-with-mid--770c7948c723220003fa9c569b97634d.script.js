(function executeRule(current, previous /*null when async*/) {
	
	//
	// Reject request if the mid_server role(s) is currently assigned to the user
	//
	
	// Determine mid_server role sys_id
	var gd_mid_role = new GlideRecord('sys_user_role');
	gd_mid_role.addQuery('name', 'mid_server');
	gd_mid_role.query();
	
	// Exit if no mid_server role defined
	if (! gd_mid_role.next())
		return;
	
	// Determine security_admin role sys_id
	var gd_security_admin_role = new GlideRecord('sys_user_role');
	gd_security_admin_role.addQuery('name', 'security_admin');
	gd_security_admin_role.query();
	
	// Exit if no mid_server role defined
	if (! gd_security_admin_role.next())
		return;
	
	// Determine if the user already has the other role
	var gd_user_has_role = new GlideRecord('sys_user_has_role');
	gd_user_has_role.addQuery('user', current.user.sys_id);
	if (current.role.sys_id == gd_security_admin_role.sys_id) {
		gd_user_has_role.addQuery('role', gd_mid_role.sys_id);
	} else {
		gd_user_has_role.addQuery('role', gd_security_admin_role.sys_id);
	}
	gd_user_has_role.query();
	
	// Reject message if both Security Admin and MID Server role assigned to the user
	if (gd_user_has_role.hasNext()) {
		
		// Rejection criteria has been met
		gs.addErrorMessage(gs.getMessage("A user cannot be granted both the mid_server and security_admin roles"));
		gs.addErrorMessage(gs.getMessage("'{0}' role assignment rejected", current.role.name));
			
		current.setAbortAction(true);
	}
		
})(current, previous);
	
