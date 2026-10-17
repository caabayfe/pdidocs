(function executeRule(current, previous /*null when async*/) {
	var tableName = String(current.source_table);
	var blacklist = new SearchSourceTableBlacklist().get();
	if (blacklist.indexOf(tableName) > -1) {
		gs.addInfoMessage('Search sources cannot be created for blacklisted tables.');
		current.setAbortAction(true);
	}
})(current, previous);
