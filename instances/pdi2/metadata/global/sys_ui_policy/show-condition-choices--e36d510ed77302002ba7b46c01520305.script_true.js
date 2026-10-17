function onCondition() {
	if (g_scratchpad.sla_metadata.engine == "2011") {
		g_form.setVisible("when_to_cancel", true);
		g_form.setVisible("when_to_resume", true);
	}
	else {
		g_form.setVisible("when_to_cancel", false);
		g_form.setVisible("when_to_resume", false);
	}
}
