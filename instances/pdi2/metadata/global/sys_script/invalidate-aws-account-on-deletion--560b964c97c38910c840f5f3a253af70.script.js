(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var gr = new GlideRecord('cmdb_ci_cloud_service_account');
	gr.addQuery('sys_id',current.getValue('cloud_service_account'));
	gr.query();
	if(gr.next()) {
		gr.setValue('is_validated',false);
		gr.update();
	}

})(current, previous);
