updateDefaultValue('sys_highlighted_value_condition', 'status', '');
function updateDefaultValue(table, columnName, defaultValue) {
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', table);
	gr.addQuery('element', columnName);
	gr.query();
	if(gr.next() && gr.getValue('default_value') !== defaultValue){
		gr.setValue('default_value',defaultValue);
		gr.update();
	}
}
