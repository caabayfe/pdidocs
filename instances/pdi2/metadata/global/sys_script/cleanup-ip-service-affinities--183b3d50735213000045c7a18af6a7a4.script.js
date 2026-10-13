(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('ip_service_affinity');
	gr.addQuery('ip_address', current.ip_address);
	gr.deleteMultiple();
})(current, previous);
