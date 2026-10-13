(function executeRule(current, previous /*null when async*/) {
	var im = new SNC.ImpactManager();
	im.notifyHashOnCreation(current.sys_id);

})(current, previous);
