(function executeRule(current, previous /*null when async*/) {
	if (current.metric != current.model.metric){
		gs.addErrorMessage("Metric should be " + current.model.metric + " but it is " + current.metric);
		current.setAbortAction(true);
	}
	
	if (current.metric_table != current.model.metric_table.sys_id){
		gs.addErrorMessage("Table should be " + current.model.metric_table.sys_id + " but it is " + current.metric_table);
		current.setAbortAction(true);
	}

})(current, previous);
