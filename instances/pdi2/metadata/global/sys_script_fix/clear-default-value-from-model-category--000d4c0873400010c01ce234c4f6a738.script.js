updateDefaultValue('cmdb_model', 'cmdb_model_category', 'Bundle', '');
function updateDefaultValue(table, columnName, currentValue, defaultValue){
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', table);
	gr.addQuery('default_value', currentValue);
	gr.addQuery('element', columnName);
	gr.query();
	if(gr.next()){
		gr.setValue('default_value',defaultValue);
		gr.update();
	}
}
