function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	
	if (newValue === '') return;
		
	g_form.setMandatory('ui_action', false);
	g_form.setMandatory('declarative_action', true);
	if (g_form.getValue('ui_action')) {
		g_form.setValue('ui_action', '');
		setTable(newValue);
	} else if(!g_form.getValue('table')) 
		setTable(newValue);

}

function setTable(daAction) {
	var ga = new GlideAjax('RecordFieldGetter');
	ga.addParam('sysparm_table','sys_declarative_action_assignment');
	ga.addParam('sysparm_name', 'getValue');
	ga.addParam('sysparm_sys_id', daAction);
	ga.addParam('sysparm_field_name', 'table');
	ga.getXMLAnswer(function(table) {
		var currentTable = g_form.getValue('table');
		if (currentTable === table) return;
		g_form.setValue('table', table);
		g_form.setValue('declarative_action', daAction);
	});	
}
