function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	if (newValue === '') return;

	g_form.setMandatory('ui_action', true);
	g_form.setMandatory('declarative_action', false);
	
	if (g_form.getValue('declarative_action')) {
		g_form.setValue('declarative_action', '');
		setTable(newValue);
	} else if(!g_form.getValue('table')) 
		setTable(newValue);
}

function setTable(uiaction) {
	var ga = new GlideAjax('RecordFieldGetter');
	ga.addParam('sysparm_name','getValue');
	ga.addParam('sysparm_table','sys_ui_action');
	ga.addParam('sysparm_sys_id', uiaction);
	ga.addParam('sysparm_field_name', 'table');
	ga.getXMLAnswer(function(table) {
		var currentTable = g_form.getValue('table');
		if (currentTable === table) return;
		g_form.setValue('table', table);
		g_form.setValue('ui_action', uiaction);
	});	
}
