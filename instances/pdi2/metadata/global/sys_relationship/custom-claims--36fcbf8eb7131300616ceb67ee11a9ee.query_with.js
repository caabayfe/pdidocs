(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	current.addQuery("jwt_provider", parent.sys_id);
	current.addQuery("is_standard_claim", false);
})(current, parent);
