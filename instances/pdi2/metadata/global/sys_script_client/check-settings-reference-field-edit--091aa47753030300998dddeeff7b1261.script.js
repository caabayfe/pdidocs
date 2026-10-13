function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	var gr = new GlideRecord("sa_metric_config_setting");
	gr.addQuery("sys_id", g_form.getValue("name"));
	gr.query();
	gr.next();

	if (gr.getValue("table_reference") != g_form.getValue("setting_reference_table")) {
 	 g_form.addErrorMessage("Please do not change the Table Name field. Resetting Table Name.");
	 g_form.setValue("setting_reference_table", gr.getValue("table_reference"));
	 g_form.setValue("setting_reference_value", "");
	}
}
