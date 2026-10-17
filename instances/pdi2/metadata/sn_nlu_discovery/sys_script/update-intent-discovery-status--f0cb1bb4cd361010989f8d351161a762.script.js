(function executeRule(current, previous /*null when async*/) {
	var job = new GlideRecord("sn_nlu_discovery_report_definition");
	if (job.get("solution_definition", current.ml_capability_definition)) {
		var currentStatus = current.getValue('state');
		job.status = currentStatus;
		if (currentStatus === "solution_complete") {
			gs.addInfoMessage(gs.getMessage("The report job has completed. Click the View Report button to view the generated report."));
		}
		if (currentStatus === "solution_cancelled") {
			var allSolutions = new GlideRecord('ml_solution');
			allSolutions.addQuery('ml_capability_definition', current.ml_capability_definition);
			allSolutions.addQuery('state', '!=', 'solution_cancelled');
			allSolutions.addQuery('sys_id', '!=', current.getUniqueValue());
			allSolutions.orderByDesc('sys_updated_on');
			allSolutions.query();
			if (allSolutions.next()) {
				job.status = allSolutions.getValue('state');
				gs.debug("The job was been cancelled. Reverting back state to "+allSolutions.getValue('state'));
			}
		}
		job.update();
	}
})(current, previous);
