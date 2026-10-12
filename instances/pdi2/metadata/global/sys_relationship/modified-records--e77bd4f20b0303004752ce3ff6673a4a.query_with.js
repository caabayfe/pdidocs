(function refineQuery(current, parent) {
	current.addQuery("context", parent.rollback_context);
	current.addQuery("operation", "update");
})(current, parent);
