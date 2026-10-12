(function executeRule(current, previous /*null when async*/) {
	if (current.getValue("rca_type") == "generated")
		return;
	
	if (current.getValue("sys_scope") == current.getValue("target_scope"))
		current.setValue("rca_type", "real_rca");
	else
		current.setValue("rca_type", "requested");

})(current, previous);
