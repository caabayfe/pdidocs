(function executeRule(current, previous /*null when async*/) {
	
	if (current.state.changesFrom(ProblemState.STATES.RESOLVED) || current.state.changesFrom(ProblemState.STATES.CLOSED)){
		current.reopened_at = new GlideDateTime();
		current.reopened_by = gs.getUserID();
		current.reopen_count = current.reopen_count + 1;

		current.setValue("closed_at", "");
		current.setValue("closed_by", "");
		current.setValue("resolved_at", "");
		current.setValue("resolved_by", "");
		current.setValue("close_notes", "");
		current.setValue("resolution_code", "");
	}
	
	current.setValue("fix_at","");
	current.setValue("fix_by","");


})(current, previous);
