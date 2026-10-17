(function executeRule(current, previous) {

	if (current.sys_scope == "global") {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Application Quota rules are not allowed on global scope'));
		return;
	}

	var gr = GlideRecord("sysrule_quota_app");
	gr.addQuery("sys_scope", current.sys_scope);
	gr.query();
	if (gr.next() && gr.sys_id != current.sys_id) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('There can be only one quota rule per application'));
	}

})(current, previous);
