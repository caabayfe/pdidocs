(function refineQuery(current, parent) {

	// Show all breakpoints for the current test and user
	current.addQuery("step.test", parent.getUniqueValue());
	current.addQuery("user", gs.getUser().getID());

})(current, parent);
