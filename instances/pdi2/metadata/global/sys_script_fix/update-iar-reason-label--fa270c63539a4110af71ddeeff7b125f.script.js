updateIARReasonLabel();

function updateIARReasonLabel() {
	var newLabel = 'Task processing state reason';
	var columnGr = new GlideRecord('sys_dictionary');
	columnGr.addQuery('name', 'sys_cs_auto_resolution_context');
	columnGr.addQuery('element', 'reason');
	columnGr.query();
	
	if (!columnGr.next())
		return;
	
	if (columnGr.getValue('column_label') === newLabel)
		return;
	
	columnGr.setValue("column_label", newLabel);
	columnGr.setValue("sys_name", newLabel);
	columnGr.update();
	
	var documentationGr = new GlideRecord('sys_documentation');
	documentationGr.addQuery('name', 'sys_cs_auto_resolution_context');
	documentationGr.addQuery('element', 'reason');
	documentationGr.query();
	documentationGr.next();
	documentationGr.setValue('label', newLabel);
	documentationGr.setValue('plural', newLabel + 's');
	documentationGr.setValue('sys_name', newLabel);
	documentationGr.update();
}
