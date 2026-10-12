(function executeRule(current, previous /*null when async*/) {
	var primaryExp = current.primary_experience;
	if (!primaryExp)
		return;
	var pageReg = GlideRecord("sys_ux_page_registry");
	pageReg.addQuery("sys_id", primaryExp);
	pageReg.query();
	if (!pageReg.next()) {
		gs.addErrorMessage(gs.getMessage('Invalid primary experience'));
		current.setAbortAction(true);
	}
	if (pageReg.getValue("parent_app") != current.sys_id) {
		gs.addErrorMessage(gs.getMessage('The parent app of the primary experience does not match'));
		current.setAbortAction(true);
	}
})(current, previous);
