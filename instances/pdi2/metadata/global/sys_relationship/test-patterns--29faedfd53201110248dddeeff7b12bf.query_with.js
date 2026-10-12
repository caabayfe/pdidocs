(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	current.addQuery("step_result.test_result", parent.getUniqueValue());

})(current, parent);
