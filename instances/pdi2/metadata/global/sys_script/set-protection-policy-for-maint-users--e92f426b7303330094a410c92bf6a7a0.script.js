(function executeRule(current, previous /*null when async*/) {

	current.sys_policy = 'read';
	gs.addInfoMessage("This Check will be read-only for non-maint users, since you created it with the maint role");

})(current, previous);
