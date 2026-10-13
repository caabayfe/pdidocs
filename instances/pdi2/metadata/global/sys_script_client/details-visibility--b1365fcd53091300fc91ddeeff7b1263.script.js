function onLoad() {
	if (g_scratchpad.isNewStateModel) {
		g_form.setSectionDisplay('details', false);
	}
	else {
		g_form.setSectionDisplay('details', true);
	}
}
