function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	
	var gr = new GlideRecord("sa_metric_config_setting");
	gr.addQuery("sys_id", g_form.getValue("name"));
	gr.query();
	gr.next();
	
	switch(gr.type.toString()) {
		case "Reference":
			g_form.setReadOnly("setting_reference_value", false);

			g_form.setValue("value", "");
			g_form.setValue("choice", "");

			g_form.setDisplay("choice", false);
			g_form.setDisplay("setting_reference_value", true);
			g_form.setDisplay("value", false);
			break;
		case "Choice":
			g_form.setReadOnly("choice", false);

			g_form.setValue("value", "");
			g_form.setValue("setting_reference_value", "");

			g_form.setDisplay("choice", true);
			g_form.setDisplay("setting_reference_value", false);
			g_form.setDisplay("value", false);
			break;
		default:
			g_form.setReadOnly("value", false);

			g_form.setValue("setting_reference_value", "");
			g_form.setValue("choice", "");

			g_form.setDisplay("choice", false);
			g_form.setDisplay("setting_reference_value", false);
			g_form.setDisplay("value", true);
	}
}
