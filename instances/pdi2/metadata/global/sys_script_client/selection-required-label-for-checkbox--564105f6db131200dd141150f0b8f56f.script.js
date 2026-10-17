function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	if(g_form.getValue("type") == "7")
	   g_form.setLabelOf('mandatory', getMessage('Selection Required'));
	else
		g_form.setLabelOf('mandatory', getMessage('Mandatory'));
}
