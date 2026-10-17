function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	if (newValue == "true")
		g_form.setVisible("auto_rearchive_duration", true);
	else
		g_form.setVisible("auto_rearchive_duration", false);		
   
}
