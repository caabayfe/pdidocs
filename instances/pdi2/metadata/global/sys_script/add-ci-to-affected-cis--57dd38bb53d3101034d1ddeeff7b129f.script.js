(function executeRule(current, previous /*null when async*/) {
	ChangeCollisionHelper.addCiToChangeAffectedCis(current.cmdb_ci, current.sys_id);
})(current, previous);
