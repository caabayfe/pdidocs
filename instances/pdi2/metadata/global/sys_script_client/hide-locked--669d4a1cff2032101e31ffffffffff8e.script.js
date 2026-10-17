function onLoad() {
	if (g_form.isNewRecord()) {
		g_form.setVisible("locked", false);
	}
	else {
		g_form.setVisible("locked", true);
	}
}
