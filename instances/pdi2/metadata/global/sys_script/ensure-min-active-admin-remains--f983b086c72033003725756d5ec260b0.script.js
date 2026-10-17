(function executeRule(current, previous /*null when async*/) {

	var sa = new ScopedAdministration();
	var userScopeAdminRolesGr = sa.getUserScopeAdminRolesGr(current.sys_id);
	while (userScopeAdminRolesGr.next()) {
		var roleSysID = userScopeAdminRolesGr.role;
		if (!sa.canDeleteActiveScopedAdminRespectingAdminMinCountProperty(current.sys_id, roleSysID)) {
			var adminMinCount = sa.getScopedAdminMinCountIfConfigured(roleSysID);
			gs.addErrorMessage(gs.getMessage("The user cannot be deleted as it would leave fewer than the configured {0} active application administrators.", [adminMinCount]));
			current.setAbortAction(true);
		}
	}

})(current, previous);
