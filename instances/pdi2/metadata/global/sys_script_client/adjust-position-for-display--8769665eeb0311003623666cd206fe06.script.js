function onLoad() {
	if (g_form.isNewRecord())
		return;
	
	g_form.setValue("index", g_form.getIntValue("index") + 1);
}
