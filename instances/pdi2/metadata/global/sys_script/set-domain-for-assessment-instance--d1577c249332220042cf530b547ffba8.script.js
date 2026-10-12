(function executeRule(current, previous /*null when async*/) {

	// Assessment instance domain = metric type domain
	current.sys_domain = current.metric_type.sys_domain;
})(current, previous);
