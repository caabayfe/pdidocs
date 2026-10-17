updateSysClassNameOnContextRecord();

function updateSysClassNameOnContextRecord() {
	var contextGr = new GlideRecord('sys_cs_auto_resolution_context');
	contextGr.addNullQuery('sys_class_name');
	
	contextGr.setValue('sys_class_name', 'sys_cs_auto_resolution_context');
	contextGr.updateMultiple();
}
