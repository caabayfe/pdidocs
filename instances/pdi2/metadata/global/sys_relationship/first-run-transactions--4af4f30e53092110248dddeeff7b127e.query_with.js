(function refineQuery(current, parent) {

	current.addQuery("step_result.step", parent.performance_stat_step.step.getValue());
	current.addQuery("performance_run", parent.performance_stat_step.comparison.run1.getValue());
	current.addQuery("transaction_pattern", parent.getValue("transaction_pattern"));

})(current, parent);
