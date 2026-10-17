(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('sn_aisearch_global_job_completion');
	gr.addQuery('table_name', current.table_name);
	gr.addQuery('source_sys_id', current.source_sys_id);
	gr.addQuery('sys_id', '!=', current.getUniqueValue());
	gr.query();
	
	if (gr.hasNext()) {
		gs.info('Record with table_name: ' + current.table_name + " and table_sys_id: " + current.table_sys_id + " was found");
		gr.deleteRecord(); // Delete the old record to make room for new one
	}
})(current, previous);
