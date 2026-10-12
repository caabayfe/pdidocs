(function refineQuery(current, parent) {

	current.addQuery("test_result", parent.getUniqueValue());
	current.addQuery("type", "IN", ["client_error", "server_error"]);
	current.addQuery("status", "warning");

})(current, parent);
