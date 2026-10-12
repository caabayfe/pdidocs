(function refineQuery(current, parent) {

	current.addQuery("step", parent.getValue("step"));
	current.addQuery("performance_run", parent.comparison.run2.getValue());

})(current, parent);
