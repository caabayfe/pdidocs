(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('sysapproval_approver');
	gr.addQuery('state','requested');
	gr.addQuery('document_id', current.getUniqueValue());
	gr.addQuery('source_table','cmdb_ci_business_process');
	gr.query();
	
	while(gr.next()){
		gr.setValue('state','cancelled');
		gr.update();
	}

})(current, previous);
