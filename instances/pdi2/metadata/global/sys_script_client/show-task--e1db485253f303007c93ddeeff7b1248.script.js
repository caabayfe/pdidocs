function onLoad() {
	if (!g_form.getValue("incident")) {
		g_form.setDisplay("incident", false);
	}
	if (!g_form.getValue("change_request")) {
		g_form.setDisplay("change_request", false);
	}
	if (!g_form.getValue("problem")) {
		g_form.setDisplay("problem", false);
	}
	
}
