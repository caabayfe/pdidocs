(function refineQuery(current, parent) {
	current.addQuery("subject", parent.subject);
	current.orderByDesc("version");
})(current, parent);
