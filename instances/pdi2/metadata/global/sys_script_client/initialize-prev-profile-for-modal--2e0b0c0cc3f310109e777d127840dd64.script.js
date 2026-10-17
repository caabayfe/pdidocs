function onLoad() {
	if (!g_form.isNewRecord() && g_form.getValue('search_engine') === "ai_search") {
		g_scratchpad.prev_profile = g_form.getValue('search_profile');
	}
}
