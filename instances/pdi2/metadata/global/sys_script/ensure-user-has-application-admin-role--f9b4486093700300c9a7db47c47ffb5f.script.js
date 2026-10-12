(function executeRule(current, previous /*null when async*/) {
	var sa = new ScopedAdministration();
	if (!sa.isScopedAdministrationOn(current.sys_scope))
		return;
	
	if (!GlideSecurityManager.get().isScopeAdmin(current.sys_scope)) {
		gs.addErrorMessage(gs.getMessage("You need to have an 'Application Administration' enabled role"));
		current.setAbortAction(true);
		return;
	}
	
	// Scoped Admin can create new roles in his scope, scoped_admin enabled role or not
	if (current.operation() == 'insert')
		return;
	
	if (current.scoped_admin.changesTo('false')) {
		var result = sa.isScopedAdminIfRoleScopedAdminDisabled(current.sys_scope, gs.getUserID(), current.sys_id);
		if (!result) {
			gs.addErrorMessage(gs.getMessage("At least one role should be an 'Application Administrator' enabled role"));
			current.setAbortAction(true);
			return;
		}
	}
})(current, previous);
