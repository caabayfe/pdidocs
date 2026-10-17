(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sn_hr_sp_esc_portal_config');
	gr.addQuery("active", true);
	gr.addQuery("sys_domain", current.sys_domain);
	gr.query();
	while (gr.next()) {
		if (gr.sys_id != current.sys_id) {
			gs.addErrorMessage(gs.getMessage("The table can have only one active record per domain"));
			current.setAbortAction(true);
		}
	}
})(current, previous);
