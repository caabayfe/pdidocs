(function executeRule(current, previous /*null when async*/) {

	if (JSUtil.notNil(current.running_process) && !current.running_process.absent)
		current.install_status = 1;

})(current, previous);
