(function refineQuery(current, parent) {
	var allCis = saListCisForIndicators(parent.sys_id);
	current.addQuery("cmdb_ci", "IN", allCis);
	current.addEncodedQuery("start_date>javascript:gs.minutesAgoStart(1)^start_dateRELATIVELE@dayofweek@ahead@7^EQ");
})(current, parent);
