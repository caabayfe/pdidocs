(function executeRule(current, previous /*null when async*/) {
	
	//update the process status of the BS to be "in_progress"
	var gr = new GlideRecord('cmdb_ci_service_discovered');
    gr.addQuery('sys_id', current.cmdb_ci_service);
    gr.query();	
	if (gr.next()) {
		gr.process_status = 2;
		gr.update();
	}

})(current, previous);
