function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading) {
	return;
   }
	if (g_form.getValue("id"))  {
		return;
	}
   if (newValue === '') {
	g_form.setVisible("type", true);
	g_form.setVisible("connection_type", true);
	g_form.setVisible("multiple_connections", true);
	g_form.setVisible("configuration_template", true);
	g_form.setVisible("retry_policy", true);
	return;
   }

   if (newValue) {
	g_form.setVisible("type", false);
	g_form.setVisible("connection_type", false);
	g_form.setVisible("multiple_connections", false);
	g_form.setVisible("configuration_template", false);
	g_form.setVisible("retry_policy", false);
   }
   
}
