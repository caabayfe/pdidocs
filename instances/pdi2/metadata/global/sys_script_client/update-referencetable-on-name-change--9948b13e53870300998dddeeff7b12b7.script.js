function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	var gr = new GlideRecord("sa_metric_config_setting");
	gr.addQuery("sys_id", newValue);
	gr.query();
	gr.next();
	g_form.setValue("setting_reference_table", gr.getValue("table_reference"));
}
