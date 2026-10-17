(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	current.addQuery("step_result", parent.step_result);
	current.addQuery("transaction", parent.transaction_id);

})(current, parent);
