(function executeRule(current, previous /*null when async*/) {
	if (current.role.nil() || current.permission_set.nil() || current.scope.nil()) {
		gs.warn("[DeleteDDRole] Not deleting role associated with sys_scope_permission_set_role_assignment "
			+ "where sys_id is: " + current.sys_id + ". Some fields empty; role: " + current.role
			+ " permission_set: " + current.permission_set + " scope:" + current.scope);
		return;
	}

	var roleSysId = current.role.sys_id;
	// sys_user_role is used by both sys_user_has_role and sys_group_has_role
	var gr = new GlideRecord("sys_user_role");
	if (!gr.get(roleSysId)) {
		gs.info("[DeleteDDRole] no user or group roles associated with sys_id: " + roleSysId);
		return;
	}

	// build up role name and validate we are removing the correct record
	var roleName = gr.getValue("name");
	if (!isRoleNameValid(roleName)) {
		gs.warn("[DeleteDDRole] Invalid role name: " + roleName);
		return;
	}

	// retrieve users and groups *before* the sys_user_role record is removed
	//   otherwise we don't have a way to get to the user/group
	var usersToCheck = getUsersToCheck(roleSysId);
	var groupsToCheck = getGroupsToCheck(roleSysId);
	var executionTracker = SNC.GlideExecutionTracker.getLastRunning();
	var numUsers = usersToCheck.length.toString();
	var numGroups = groupsToCheck.length.toString();
	executionTracker.updateMessage(
		gs.getMessage("Removing developer role assignments for permission '{0}' from {1} users, {2} groups",
			[current.permission_set.getDisplayValue(),numUsers,numGroups]));

	if (!gr.deleteRecord()) {
		gs.warn("[DeleteDDRole] Unable to delete Delegated developer role with name: " + roleName);
		return;
	}

	for (var i = 0; i < usersToCheck.length; i++) {
		SNC.DelegatedDevelopmentUtil.revokeDelegateDevRoleIfNotNeeded("user", usersToCheck[i]);
	}
	for (i = 0; i < groupsToCheck.length; i++) {
		SNC.DelegatedDevelopmentUtil.revokeDelegateDevRoleIfNotNeeded("group", groupsToCheck[i]);
	}

})(current, previous);

function getUsersToCheck(roleSysId) {
	// retrieve ALL user sys_id(s) before the sys_user_role is deleted
	var sysUserHasRoleGr = new GlideRecord("sys_user_has_role");
	sysUserHasRoleGr.addQuery("role", roleSysId);
	sysUserHasRoleGr.addQuery("inherited", "false");
	sysUserHasRoleGr.query();
	var usersToCheck = [];
	while (sysUserHasRoleGr.next()) {
		usersToCheck.push(sysUserHasRoleGr.getValue("user"));
	}

	return usersToCheck;
}

function getGroupsToCheck(roleSysId) {
	// retrieve ALL group sys_id(s) before the sys_user_role is deleted
	var sysGroupHasRoleGr = new GlideRecord("sys_group_has_role");
	sysGroupHasRoleGr.addQuery("role", roleSysId);
	sysGroupHasRoleGr.addNullQuery("granted_by").addOrCondition("granted_by", "not-applicable");
	sysGroupHasRoleGr.query();
	var groupsToCheck = [];
	while (sysGroupHasRoleGr.next()) {
		groupsToCheck.push(sysGroupHasRoleGr.getValue("group"));
	}

	return groupsToCheck;
}

function isRoleNameValid(roleName) {
	if (JSUtil.nil(roleName))
		return false;

	var roleNameWithoutSuffix = roleName.replace(/_rc_\d\d/, "");
	var permissionName = current.permission_set.name + '';
	var permissionSuffix = permissionName.replace(/[^\w]/g, "").toLowerCase();
	return roleNameWithoutSuffix.startsWith("sn_dd_") && roleNameWithoutSuffix.endsWith("_" + permissionSuffix);
}
