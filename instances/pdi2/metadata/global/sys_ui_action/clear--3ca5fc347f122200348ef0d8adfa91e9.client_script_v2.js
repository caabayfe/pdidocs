function onClick(g_form) {
	if (g_form) {
		g_form.clearValue("template");
		if (g_form.getValue("template_v2")) {
			g_form.clearValue("template_v2");
		}
	}
}
