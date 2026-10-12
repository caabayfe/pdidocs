function onLoad() {
   	var currentView = g_form.getParameter("view");
	if (currentView == "IntegrationHub")
		g_form.setMandatory("tag", true);
	else {
		g_form.setMandatory("tag", false);
	}
}
