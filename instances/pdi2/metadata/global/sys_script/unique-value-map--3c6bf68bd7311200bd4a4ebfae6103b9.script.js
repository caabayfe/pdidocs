(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord("sys_report_map_source_mappings");
	gr.addQuery('value',current.value);
	gr.addQuery('map', current.map);
	gr.addQuery('report_map_source_mapping', current.report_map_source_mapping);
	if (current.sys_id != '')
		gr.addQuery('sys_id','!=', current.sys_id);
	
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage("You can't create a mapping with a value {0} that already exist (for the selected map)",current.value));
		
		current.setAbortAction(true);
	}

})(current, previous);
