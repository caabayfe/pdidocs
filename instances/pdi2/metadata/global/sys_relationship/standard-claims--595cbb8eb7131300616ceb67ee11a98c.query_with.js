(function refineQuery(current, parent) {
	current.addQuery("jwt_provider", parent.sys_id);
	current.addQuery("is_standard_claim", true);
})(current, parent);
