function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	
	var gr = new GlideRecord("sys_pd_trigger_definition");
	var isValid = gr.get(newValue);
	
	if (isValid)
		g_form.setValue("trigger_type", gr.getValue("trigger_type"));
	else
		g_form.setValue("trigger_type", "");
}
