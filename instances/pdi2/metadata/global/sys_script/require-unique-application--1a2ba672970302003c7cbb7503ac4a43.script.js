(function executeRule(current, previous /*null when async*/) {

	// allow when removing application or it hasn't changed
	if (current.sys_app.nil() || !current.sys_app.changes())
		return;
		
	// abort insert/update if application already used by another record
	var ga = new GlideAggregate("sys_repo_config");
	ga.addQuery("sys_app", current.sys_app);
	ga.query();
	if (ga.getRowCount() > 0) {
		gs.addErrorMessage(gs.getMessage("Another record is already associated to this application: {0}", current.sys_app.name));
		current.sys_app = null;
		current.setAbortAction(true);
	}

})(current, previous);
