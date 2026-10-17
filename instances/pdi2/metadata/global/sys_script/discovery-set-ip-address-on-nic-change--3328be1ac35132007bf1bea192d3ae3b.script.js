(function executeRule(current, previous /*null when async*/) {

	var ips = new GlideRecord('cmdb_ci_ip_address');
	ips.addQuery('nic', current.sys_id);
	ips.setValue('install_status', current.getValue('install_status')); // absent or retired
	ips.updateMultiple();

})(current, previous);
