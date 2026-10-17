(function executeRule(current, previous /*null when async*/) {
	//assessment group domain is same as metric type domain
	current.sys_domain = current.metric_type.sys_domain;
})(current, previous);
