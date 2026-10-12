(function refineQuery(current, parent) {
	current.addQuery("hash", parent.slow_query.hash);
	var query = current.addQuery("window_end.source_id", parent.getUniqueValue());
	query.addOrCondition("window_start.source_id", parent.getUniqueValue());
})(current, parent);
