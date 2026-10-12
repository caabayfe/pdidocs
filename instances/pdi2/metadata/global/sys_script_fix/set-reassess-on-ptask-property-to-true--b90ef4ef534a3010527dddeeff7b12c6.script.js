(function() {
	if (GlidePluginManager.isZboot())
		return;
	var prevWF = gs.getSession().getWorkflow();
	try {
		gs.getSession().setWorkflow(true);
		gs.setProperty('problem_task.closed.can_reassess_on_closed_problem', true);
	}
	finally{
		gs.getSession().setWorkflow(prevWF);
	}
})();
