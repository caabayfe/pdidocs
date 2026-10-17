(function executeRule(current, previous /*null when async*/) {
	MIDServerUtil.createOrUpdateIssue(current.sys_id, 'home path', 
	'The home directory changed from ' + previous.home_dir + ' to ' + current.home_dir + '.  This issue must be manually resolved.');
})(current, previous);
