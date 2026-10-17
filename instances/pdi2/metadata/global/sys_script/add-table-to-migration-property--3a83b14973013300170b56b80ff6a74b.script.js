(function executeRule(current, previous /*null when async*/) {
	var tableName = current.table;
	new GlideTSUtil().addTableToMigrationList(tableName);
})(current, previous);
