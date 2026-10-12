(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('license_dashboard_inventory');
	if(gr.get('dashboard_id', current.dashboard_id)) {
		current.dashboard = gr.sys_id;
		current.update();
	}
})(current, previous);
