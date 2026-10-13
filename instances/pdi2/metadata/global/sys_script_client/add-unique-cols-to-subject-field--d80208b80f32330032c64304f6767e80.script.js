function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
		g_form.clearOptions();
		g_form.addOption("subject_field", "sys_id", "sys_id");
		return;
   }

	var gr = new GlideRecord("sys_dictionary");
	gr.addQuery("name", newValue);
	gr.addQuery("unique", true);
	gr.query();
	while (gr.next())
		g_form.addOption("subject_field", gr.element, gr.element);
	
}
