(function executeRule(current, previous /*null when async*/) {
	var currentDir = current.getValue('mid_java_command_dir');
	
	if(currentDir.startsWith(current.getValue('home_dir'))) {
		var prevVersion = previous.getValue('jvm_version');
		var currentVersion = current.getValue('jvm_version');
		MIDServerUtil.createOrUpdateIssue(current.getValue('sys_id'), 'MidJRE', 
						'Detected JRE switched from version ' + prevVersion + ' to bundled version ' + currentVersion);
	}

})(current, previous);
