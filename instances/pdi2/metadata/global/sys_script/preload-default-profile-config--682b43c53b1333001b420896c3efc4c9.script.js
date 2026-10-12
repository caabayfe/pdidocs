(function executeRule(current, previous /*null when async*/) {

	var profileSysId = current.getValue('sys_id');
	CloneProfileUtil.buildDefaultProfileConfig(profileSysId);

})(current, previous);
