function onLoad() {
	if (g_scratchpad.show_conference_provider)
		g_form.setDisplay('conference_provider', true);
	else {
		g_form.setDisplay('conference_provider', false);
		g_form.setMandatory('notify_group', true);
	}
}
