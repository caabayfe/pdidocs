(function executeRule(current, previous /*null when async*/) {
	var sourceQuery = "source=";
	var activeQuery = "active=";
	var query = current.getEncodedQuery();
	if (query.contains(sourceQuery) && !query.contains(activeQuery)){
		current.addActiveQuery();
	}
})(current, previous);
