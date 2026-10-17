(function refineQuery(current, parent) {

	current.addQuery("step", parent.getValue("step"));
	current.addQuery("performance_run", parent.comparison.run1.getValue());

})(current, parent);
