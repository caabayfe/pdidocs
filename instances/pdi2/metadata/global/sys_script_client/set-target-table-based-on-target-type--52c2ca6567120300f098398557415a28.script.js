function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	if (newValue == "1")
	   g_form.setValue("target_table", "sys_db_object");
	else if (newValue == "2")
		g_form.setValue("target_table", "sys_script_include");
	else if (newValue == "5")
		g_form.setValue("target_table", "sys_dictionary");
	else
		g_form.setValue("target_table", "sysevent_register");
   
}
