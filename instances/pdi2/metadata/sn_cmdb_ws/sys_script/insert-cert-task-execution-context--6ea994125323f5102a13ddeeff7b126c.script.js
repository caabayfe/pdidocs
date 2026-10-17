(function executeRule(current, previous /*null when async*/) {

	new CMDBWsDMTaskManager().insertCertExecutionContext(current.sys_id, current.policy_id);

})(current, previous);
