(function executeRule(current, previous /*null when async*/) {
	var transaction = GlideTransaction.get();
	var targetRecordId = transaction.getRequestParameter('sysparm_record_target_id');
	var targetRecordTable = transaction.getRequestParameter('sysparm_record_target_table');
	
	if (targetRecordId && targetRecordTable) {
		var gr = new GlideRecord(targetRecordTable);  
		gr.addQuery('sys_id', targetRecordId);
		gr.query();
		while (gr.next()) { 
			current.title= gr.getValue('title') + '_Copy';
			current.category= gr.getValue('category');
			current.table= gr.getValue('table');
			current.condition= gr.getValue('condition');
			current.columns= gr.getValue('columns');
		}
	}

})(current, previous);
