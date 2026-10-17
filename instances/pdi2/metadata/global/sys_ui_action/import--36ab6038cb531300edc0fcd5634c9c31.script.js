function importSets() {
	
	var tableName = 'sys_atf_parameter_set';
	var modelId = g_form.getUniqueValue();
	
	var dialogWindow = new GlideModal('import_parameter_sets');
	dialogWindow.setSize(900);
	dialogWindow.setTitle("Import Test Run Data Sets");
	dialogWindow.setPreference('sysparm_referring_url', 'sys_atf_parameter_set_list.do');
	dialogWindow.setPreference('sysparm_target', tableName);
	dialogWindow.setPreference('focusTrap', true);
	dialogWindow.setPreference('sysparm_variable_model_id', modelId);
	dialogWindow.render();
}
