fixRefRules();

function fixRefRules(){
	if(pm.isZboot()){
		return;
	} else {
		fixTable('cmdb_ci_state_management_task_to_ci');
		fixTable('cmdb_data_management_task_to_ci');
	}
}

function fixTable(tableName){
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', tableName);
	gr.addQuery('element', 'ci');
	gr.addQuery('reference_cascade_rule','none');
	gr.query();
	if(gr.next()){
		gr.setValue('reference_cascade_rule', 'delete');
		gr.update();
	} else {
		gs.warn('CMDB FIX SCRIPT: Skipped modification of reference_cascade_rule for table: {0}, record not found or value modified from OOB', tableName);
	}
}
