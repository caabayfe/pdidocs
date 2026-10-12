(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	current.addQuery("result", parent.getValue("sys_id"));
	current.addNotNullQuery("message");

})(current, parent);
