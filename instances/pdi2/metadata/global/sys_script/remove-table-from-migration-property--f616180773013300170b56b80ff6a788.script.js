(function executeRule(current, previous /*null when async*/) {
	var tableName = current.table;
	new GlideTSUtil().removeTableFromMigrationList(tableName);
})(current, previous);
