(function executeRule(current, previous /*null when async*/) {
	if (new ScopedAdministration().isScopedAdministrationOn(current.sys_scope) && gs.getSession().getRoles().indexOf(current.getDisplayValue('assignable_by')) < 0) {
		gs.addErrorMessage(gs.getMessage("To avoid a potential lockout, you need to have the chosen 'Assignable by' role to be able to set it"));
		current.setAbortAction(true);
	}
})(current, previous);
