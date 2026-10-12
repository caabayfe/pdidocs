(function executeRule(current, previous /*null when async*/) {
	new SNC.GlideTermTableAPI().deleteTermConfig(current);
})(current, previous);
