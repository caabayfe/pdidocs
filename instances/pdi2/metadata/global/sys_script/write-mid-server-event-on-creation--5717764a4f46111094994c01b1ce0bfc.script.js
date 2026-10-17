(function executeRule(current, previous /*null when async*/) {
	var clusterName = MIDServerUtil.getClusterName(current.sys_id);
	MIDServerUtil.writeEvent(current.name, clusterName, "created");
})(current, previous);
