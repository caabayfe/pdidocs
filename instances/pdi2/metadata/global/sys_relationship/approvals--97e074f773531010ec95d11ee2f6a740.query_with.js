(function refineQuery(current, parent) {

	current.addQuery('document_id', parent.getUniqueValue());
	current.addQuery('source_table', parent.getTableName());

})(current, parent);
