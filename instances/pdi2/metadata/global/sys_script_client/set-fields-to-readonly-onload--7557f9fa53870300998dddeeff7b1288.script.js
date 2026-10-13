function onLoad() {
	var grSetting = new GlideRecord("sa_metric_config_setting");
	grSetting.addQuery("sys_id", g_form.getValue("name"));
	grSetting.query();

	if (grSetting.next()) {

		switch(grSetting.type.toString()) {
		  case "Reference":
			g_form.setReadOnly("setting_reference_value", false);

			g_form.setValue("value", "");
			g_form.setValue("choice", "");

			g_form.setDisplay("setting_reference_value", true);
			g_form.setDisplay("value", false);
			g_form.setDisplay("choice", false);
			break;
		  case "Choice":
			g_form.setReadOnly("choice", false);

 			g_form.setValue("setting_reference_value", "");
			g_form.setValue("value", "");
 
			g_form.setDisplay("setting_reference_value", false);
			g_form.setDisplay("value", false);
			g_form.setDisplay("choice", true);
			break;
		  default:
			g_form.setReadOnly("value", false);

			g_form.setValue("setting_reference_value", "");
			g_form.setValue("choice", "");

			g_form.setDisplay("setting_reference_value", false);
			g_form.setDisplay("value", true);
			g_form.setDisplay("choice", false);
			break;
		}
	} else {
 		g_form.setDisplay("setting_reference_value", false);
 		g_form.setDisplay("value", false);
		g_form.setDisplay("choice", false);
	}
}
