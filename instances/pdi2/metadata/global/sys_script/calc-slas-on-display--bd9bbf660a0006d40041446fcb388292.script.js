(function executeRule(current, previous /*null when async*/) {
	// if this Task has unprocessed records in the "sla_async_queue" then do not call SLACalculatorNG
	if (new SLAAsyncQueue().isTaskQueued(current.getUniqueValue()))
		return;
	
	var task_sla = new GlideRecord("task_sla");
	task_sla.addQuery("task", current.sys_id);
	task_sla.addActiveQuery();
	task_sla.addQuery('stage','!=','paused');
	task_sla.query();
	while (task_sla.next()) {
		//Disable running of workflow for recalculation of sla.
		task_sla.setWorkflow(false);

		if (gs.getProperty("com.snc.sla.engine.version", "2010") === "2011")
			SLACalculatorNG.calculateSLA(task_sla);
		else {
			var slac = new SLACalculator();
			slac.calcAnSLA(task_sla);
		}
	}

})(current, previous);
