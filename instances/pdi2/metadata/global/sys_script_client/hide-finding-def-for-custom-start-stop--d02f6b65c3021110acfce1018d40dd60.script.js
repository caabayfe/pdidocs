function onLoad() {
   //Type appropriate comment here, and begin script below
	if(!g_form.isNewRecord() && !g_form.getValue("finding_def")) {
		g_form.setMandatory("finding_def", false);
		g_form.setDisplay("finding_def", false);
	}  
}
