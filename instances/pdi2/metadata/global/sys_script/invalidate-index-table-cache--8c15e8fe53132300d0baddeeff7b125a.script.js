(function executeRule(current, previous /*null when async*/) {
	new GlideTSUtil().invalidateTableCache(current.table);
})(current, previous);
