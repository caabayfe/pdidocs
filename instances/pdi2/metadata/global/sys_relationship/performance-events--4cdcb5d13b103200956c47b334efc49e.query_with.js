(function refineQuery(current, parent) {
	current.addQuery("source_id", parent.getUniqueValue());
	current.addQuery("source_table", "sys_index_suggestion");
})(current, parent);
