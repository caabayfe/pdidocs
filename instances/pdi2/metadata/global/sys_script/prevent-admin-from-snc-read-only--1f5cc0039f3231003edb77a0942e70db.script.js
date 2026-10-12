
function onBefore(current, previous) {
	var grUserRole = new GlideRecord("sys_user_role");
	grUserRole.addQuery("name", "admin");
	grUserRole.query();
	grUserRole.next();
	var adminRoleId = grUserRole.getValue("sys_id");
		
	grUserRole = new GlideRecord("sys_user_role");
	grUserRole.addQuery("name", "snc_read_only");
	grUserRole.query();
	grUserRole.next();
	var readOnlyRoleId = grUserRole.getValue("sys_id");
	
	if (current.role != adminRoleId && current.role != readOnlyRoleId && 
		current.contains != adminRoleId && current.contains != readOnlyRoleId) {
		return;
	}
	
	if ((current.role == adminRoleId && current.contains == readOnlyRoleId) || 
		(current.role == readOnlyRoleId && current.contains == adminRoleId)) {
		// case (direct): admin[->]snc_read_only OR: snc_read_only[->]admin
   		postError();
	} else if (current.role == adminRoleId && roleContains(current.contains, readOnlyRoleId)) {
		// case (indirect): admin[->]ROLE->snc_read_only
   		postError();
	} else if (current.contains == readOnlyRoleId && roleContains(adminRoleId, current.role)) {
		// case (indirect): admin->ROLE[->]snc_read_only
   		postError();
	} else if (current.role == readOnlyRoleId && roleContains(current.contains, adminRoleId)) {
		// case (indirect): snc_read_only[->]ROLE->admin
   		postError();
	} else if (current.contains == adminRoleId && roleContains(readOnlyRoleId, current.role)) {
		// case (indirect): snc_read_only->ROLE[->]admin
   		postError();
	}
}

function roleContains(roleId, containsId) {
	var grURC = new GlideRecord("sys_user_role_contains");
	grURC.addQuery("role", roleId);
	grURC.addQuery("contains", containsId);
	grURC.query();
	if (grURC.hasNext())
		return true;
	return false;
}

function postError() {
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("The admin role is not allowed to contain, directly or indirectly, the snc_read_only role!"));
}
