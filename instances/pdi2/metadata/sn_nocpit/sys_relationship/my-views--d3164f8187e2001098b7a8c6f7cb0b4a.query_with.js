(function refineQuery(current, parent) {
	current.addQuery("user_id", "=", parent.user_id);
	current.addQuery("view_name", "!=", "default");
})(current, parent);
