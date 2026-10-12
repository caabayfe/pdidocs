(function executeRule(current, previous /*null when async*/) {

	var sa = new ScopedAdministration();
	if (sa.isScopeAdminRole(current.contains) &&
	!sa.canDeleteScopedAdminContainedRoleRespectingAdminMinCountProperty(current.role, current.contains)) {
		var adminMinCount = sa.getScopedAdminMinCountIfConfigured(current.contains);
		gs.addErrorMessage(gs.getMessage("The role cannot be deleted as it would leave fewer than the configured {0} active application administrators.", [adminMinCount]));
		current.setAbortAction(true);
	}

})(current, previous);
