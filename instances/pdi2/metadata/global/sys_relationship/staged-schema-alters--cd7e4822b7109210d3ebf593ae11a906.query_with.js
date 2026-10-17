(function refineQuery(current, parent) {

	current.addQuery("started", ">", parent.getValue("started"));
	current.addQuery("finished", "<=", parent.getValue("finished"));

})(current, parent);
