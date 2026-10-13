(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('cmdb_rel_attributes');
	if (!gr.isValid())
		return;
	
	gr.addQuery('classification', current.sys_id);
	gr.setValue('classification', '');
	gr.updateMultiple();

})(current, previous);
