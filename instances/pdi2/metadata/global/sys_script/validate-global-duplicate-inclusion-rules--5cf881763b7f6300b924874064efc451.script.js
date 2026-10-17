(function executeRule(current, previous /*null when async*/) {
	if(current.metric.name == 'Duplicate' && (current.sys_domain.name != "global" && current.sys_domain.name != "")) {
		var msg = gs.getMessage("Applying a health inclusion rule to the Duplicate metric is supported only in the global domain.");
		gs.addErrorMessage(msg);
		current.setAbortAction(true);
	}
})(current, previous);
