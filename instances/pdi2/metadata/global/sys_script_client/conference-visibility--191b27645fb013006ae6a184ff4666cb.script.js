function onLoad() {
	if (g_scratchpad.isCollaborationChannelAvailable && !g_form.isNewRecord()) {
		g_form.setSectionDisplay('collaborate', true);
	}
	else {
		g_form.setSectionDisplay('collaborate', false);
	}
}
