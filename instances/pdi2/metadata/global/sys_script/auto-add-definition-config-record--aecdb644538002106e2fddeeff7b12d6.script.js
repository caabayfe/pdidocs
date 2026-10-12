(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var definitionConfigGr = new GlideRecord('sys_one_extend_definition_config');
	
	definitionConfigGr.initialize();
	definitionConfigGr.setValue('default', false);
	definitionConfigGr.setValue('capability', current.capability);
	definitionConfigGr.setValue('definition', current.sys_id);

	definitionConfigGr.insert();

})(current, previous);
