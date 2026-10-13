(function executeRule(current, previous /*null when async*/) {

	var dr = new DiscoveryResult(current.sys_id);
	dr.markCompleted();
	var d = new Discovery();
	d.completed();

})(current, previous);
