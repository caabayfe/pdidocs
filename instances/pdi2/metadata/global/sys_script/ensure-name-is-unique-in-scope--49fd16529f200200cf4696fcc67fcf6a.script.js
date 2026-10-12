function onBefore(current, previous) {
	//This function will be automatically called when this rule is processed.
	var match = new GlideRecord('sys_auth_profile_oauth2');
	match.addQuery('sys_id', '!=', current.sys_id);
	match.addQuery('name', current.name);
	match.addQuery('sys_scope', current.sys_scope);
	match.addActiveQuery();
	match.query();
	if (match.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage("An OAuth Profile with name '" + current.name + "' is already defined in the current scope.");
	}
}
