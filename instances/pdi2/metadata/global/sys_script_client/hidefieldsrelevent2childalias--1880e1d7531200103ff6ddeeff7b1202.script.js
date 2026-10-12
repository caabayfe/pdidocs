function onLoad() {
   if (g_form.getValue("parent")) {
		if (g_form.isNewRecord()) {
			g_form.setVisible("parent", false);
			g_form.setVisible("type", false);
			g_form.setVisible("connection_type", false);
			g_form.setVisible("multiple_connections", false);
			g_form.setVisible("configuration_template", false);
			g_form.setVisible("retry_policy", false);
		}
   }
}
