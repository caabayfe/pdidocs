(function executeRule(current, previous /*null when async*/) {

	// only one type of record for one rest insert multiple
	var gr = new GlideRecord('sys_rest_insert_multiple_column_mapping');
	gr.addQuery('rest_insert_multiple', current.rest_insert_multiple);
	gr.addQuery('type', current.type);
	gr.query();
	
	if (gr.next() && gr.sys_id != current.sys_id){
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('{0} already has a {1} column mapping', [current.rest_insert_multiple.name, current.type]));
	}
	
	
		

})(current, previous);
