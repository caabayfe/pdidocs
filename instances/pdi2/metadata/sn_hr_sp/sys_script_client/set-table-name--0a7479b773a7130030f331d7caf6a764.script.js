function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue === '')
      return;

	if (g_form.getValue("to_dos_configuration"))
		g_form.getReference('to_dos_configuration', setTableName);   
}

function setTableName(todoConfigRef) {
	g_form.setReadOnly(false);
    g_form.setValue('table', todoConfigRef.table); 
	g_form.setReadOnly(true);
}   
