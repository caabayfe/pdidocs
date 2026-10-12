(function executeRule(current, previous /*null when async*/) {

	//Create the manifest entry
	var manifestEntry = new GlideRecord('sys_app_template_manifest');
	manifestEntry.newRecord();
	manifestEntry.setValue('table', 'sys_hub_flow');
	manifestEntry.setValue('template', current.sys_id);
	manifestEntry.setValue('order', '100');
	
	if (!manifestEntry.insert()) {
		gs.addErrorMessage(gs.getMessage(
			'Error creating template manifest record: {0}', manifestEntry.getLastErrorMessage()));
	}
	
})(current, previous);
