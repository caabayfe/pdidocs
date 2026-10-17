(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	current.addQuery("type", "client_error");
	current.addQuery("output", "CONTAINS", parent.error_message);
	current.orderByDesc("recorded_at");

})(current, parent);
