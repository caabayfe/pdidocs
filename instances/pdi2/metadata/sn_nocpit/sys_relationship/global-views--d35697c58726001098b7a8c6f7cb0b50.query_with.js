(function refineQuery(current, parent) {
	current.addQuery("user_id", "=", "NULL");
	current.addQuery("view_name", "!=", "default");
})(current, parent);
