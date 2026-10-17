updateDefaultValue('sys_sg_ui_parameter', 'max_entries', 1);
updateDefaultValue('sys_sg_grouped_input', 'max_entries', 1);
function updateDefaultValue(table, columnName, defaultValue) {
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', table);
	gr.addQuery('element', columnName);
	gr.setWorkflow(false);
	gr.addQuery('default_value','ISEMPTY','');
	gr.query();
	if(gr.next() && gr.getValue('default_value') !== defaultValue){
		gr.setValue('default_value', defaultValue);
		gr.update();
		gs.info('set sys_sg_ui_parameter max_entries to 1');
		gs.info('set sys_sg_grouped_input max_entries to 1');
	}
}
