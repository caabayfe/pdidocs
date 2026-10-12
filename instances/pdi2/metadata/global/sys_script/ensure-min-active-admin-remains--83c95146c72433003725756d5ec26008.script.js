(function executeRule(current, previous /*null when async*/) {
	var sa = new ScopedAdministration();
	var userScopeAdminRolesGr = sa.getUserScopeAdminRolesGr(current.sys_id);
	var containsNoScopedAdminRoleOrShouldInactivate = true;
	while (userScopeAdminRolesGr.next()) {
		var roleSysID = userScopeAdminRolesGr.role;
		if (!sa.canDeleteActiveScopedAdminRespectingAdminMinCountProperty(current.sys_id, roleSysID)) {
			var adminMinCount = sa.getScopedAdminMinCountIfConfigured(roleSysID);
			gs.addErrorMessage(gs.getMessage("The user cannot be inactivated as it would leave fewer than the configured {0} active application administrators.", [adminMinCount]));
			current.locked_out = false;
			containsNoScopedAdminRoleOrShouldInactivate = false;
			current.setAbortAction(true);
		}
	}
	if (containsNoScopedAdminRoleOrShouldInactivate) {		
		current.locked_out = true;
	}
})(current, previous);
