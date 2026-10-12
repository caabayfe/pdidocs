function onLoad() {
	if(!g_form.isNewRecord()) {
		return;
	}
   //Type appropriate comment here, and begin script below
   g_form.setValue("max_drift", "2 00:00:00");
   
}
