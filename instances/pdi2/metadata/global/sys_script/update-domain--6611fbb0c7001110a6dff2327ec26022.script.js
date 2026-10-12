(function executeRule(current, previous /*null when async*/) {
	current.sys_domain = current.service_offering ? current.service_offering.sys_domain : current.cmdb_ci.sys_domain;
})(current, previous);
