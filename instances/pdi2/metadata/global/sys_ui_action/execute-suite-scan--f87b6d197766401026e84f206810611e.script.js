function openScanTargetsModal() {
	var ga = new GlideAjax('ScanAjaxProcessor');
	ga.addParam('sysparm_metric_event', 'suite_ui_execute_suite_scan_button_clicked');
	ga.addParam('sysparm_name', 'collectUsageMetricWithParam');
	ga.getXML();

	var gm = new GlideModal('scan_targets_modal');
	gm.setTitle('Scan Suites Now');  			      	
	gm.setWidth(500);
	
	// pass params to modal
	gm.setPreference('sysparm_message', 'Select targets for this scan');
	gm.setPreference('sysparm_button_text', 'Execute Scan');
	gm.setPreference('sysparm_action', 'execute');
	
	gm.render(); 
}
