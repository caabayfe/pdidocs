function openModalForSchedulingScan() {
	var ga = new GlideAjax('ScanAjaxProcessor');
	ga.addParam('sysparm_metric_event', 'suite_ui_schedule_tab_new_button_clicked');
	ga.addParam('sysparm_name', 'collectUsageMetricWithParam');
	ga.getXML();

	var gm = new GlideModal('scan_targets_modal');
	gm.setTitle('Schedule Suite Scan');
	gm.setWidth(500);
	
	// pass params to modal
	gm.setPreference('sysparm_message', 'Select targets for this scan');
	gm.setPreference('sysparm_button_text', 'Schedule Scan');
	gm.setPreference('sysparm_action', 'schedule');
	
	gm.render();
}
