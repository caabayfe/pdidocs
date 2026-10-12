(function executeRule(current, previous /*null when async*/) {

	var match = new GlideRecord('sys_run_level_op_toggle_override');
	match.addQuery('m2m', current.m2m);
	match.query();
	if (match.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("This Run Level Mapping is already overridden."));	
	}


})(current, previous);
