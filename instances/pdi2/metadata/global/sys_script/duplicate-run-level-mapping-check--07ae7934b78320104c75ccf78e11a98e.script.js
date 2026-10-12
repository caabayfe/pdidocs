(function executeRule(current, previous /*null when async*/) {

	var match = new GlideRecord('sys_run_level_op_toggle_m2m');
	match.addQuery('level', current.level);
	match.addQuery('toggle', current.toggle);
	match.addQuery('toggle_level', current.toggle_level);
	match.query();
	if (match.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("This Run Level Mapping is already defined."));	
	}
})(current, previous);
