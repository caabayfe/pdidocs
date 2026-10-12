function onLoad() {
	g_form.setDisplay("use_m2m", false);
	if(g_form.isNewRecord()){
		g_form.setValue("use_m2m", true);
	}
}
