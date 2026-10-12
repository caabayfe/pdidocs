(function refineQuery(current, parent) {
	current.addQuery("license_type", 2);
	current.addQuery("sys_id", "!=", parent.getUniqueValue());
})(current, parent);
