(function(current, query_table){
	/**
	 * current: A GlideRecord representing the Form or Record producer
	 * query_table: The table to compare value on
	 *
	 * Use the standard query features of GlideRecord to add conditions to query_table.
	 * Current prepresents the current values on the user's form or record producer that
	 * can be used to add live conditions to the query.
	 *
	 * E.g. query_table.addQuery("active", current.active);
	 *
	 * The return value should always be the encoded query, usually query_table.getEncodeQuery()
	 */
	
	query_table.addActiveQuery();
	if (!current.work_start.isNil()) // Use the "Actual start date" if we have one
		query_table.addQuery("sys_created_on", ">=", current.work_start);
	else if (!current.start_date.isNil()) // If we don't have an Actual, use the Planned start date
		query_table.addQuery("sys_created_on", ">=", current.start_date);
	
	return query_table.getEncodedQuery();
})(current, query_table);
