function onLoad() {
	if (g_form.getValue("type") == "Reference") {
		g_form.setReadOnly("table_reference", false);
		g_form.setReadOnly("value", true);
		g_form.setReadOnly("min", true);
		g_form.setReadOnly("max", true);

		g_form.setValue("value", "");
		g_form.setValue("min", "");
		g_form.setValue("max", "");
	} else {
		g_form.setReadOnly("table_reference", true);
		g_form.setReadOnly("value", false);
		g_form.setReadOnly("min", false);
		g_form.setReadOnly("max", false);

		g_form.setValue("table_reference", "");
	}
}
