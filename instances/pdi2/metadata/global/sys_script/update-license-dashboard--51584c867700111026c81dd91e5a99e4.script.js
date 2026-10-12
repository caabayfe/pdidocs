(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('license_dashboard');
	if(gr.get('dashboard_id', current.dashboard_id)) {
		gr.dashboard = current.sys_id;
		gr.update();
	}
})(current, previous);
