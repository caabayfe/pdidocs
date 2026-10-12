(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('discovery_result');
	gr.query('status', current.sys_id + '');
	gr.deleteMultiple();
	
})(current, previous);
