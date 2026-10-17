(function executeRule(current, previous /*null when async*/) {
	var problemTaskGr = new GlideRecord("problem_task");
	problemTaskGr.addQuery("prb_task_model", current.getUniqueValue());
	problemTaskGr.setLimit(1);
	problemTaskGr.query();
	
	if (problemTaskGr.next()) {
		current.setAbortAction(true);
		gs.addInfoMessage(gs.getMessage("In use Problem task model cannot be deleted"));
	}
})(current, previous);
