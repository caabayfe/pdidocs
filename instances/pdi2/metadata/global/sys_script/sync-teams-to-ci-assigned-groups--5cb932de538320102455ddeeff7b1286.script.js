(function executeRule(current, previous /*null when async*/) {
	
	new CMDBTeamsUtil().syncTeamsWithGroups(current);

})(current, previous);
