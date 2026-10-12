(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('problem_task');
	gr.addQuery('problem', current.problem);
	gr.addQuery('active', true);
	gr.query();
	if (gr.hasNext())
		return;
	else
		gs.eventQueue('problem.problem_tasks.closed', current.problem.getRefRecord());

})(current, previous);
