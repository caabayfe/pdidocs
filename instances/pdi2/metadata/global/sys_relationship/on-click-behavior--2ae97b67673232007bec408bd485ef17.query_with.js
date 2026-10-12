(function refineQuery(current, parent) {

	current.addQuery("table", parent.getTableName());
	current.addQuery("widget", parent.getUniqueValue());

})(current, parent);
