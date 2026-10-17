function onLoad() {
	if (g_form.getBooleanValue("auto_rearchive") == false) {
		g_form.setVisible("auto_rearchive_duration", false);
	}
   
}
