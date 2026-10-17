(function(current, query_table){
	query_table.addQuery("table", current.getTableName());
	
	// Return the encoded query
	return query_table.getEncodedQuery();
})(current, query_table);
