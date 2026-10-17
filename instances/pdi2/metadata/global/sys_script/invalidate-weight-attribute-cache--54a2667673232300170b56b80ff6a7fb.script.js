(function executeRule(current, previous /*null when async*/) {
		new GlideTSUtil().removeWeightAttributeCacheFor(current.table);
})(current, previous);
