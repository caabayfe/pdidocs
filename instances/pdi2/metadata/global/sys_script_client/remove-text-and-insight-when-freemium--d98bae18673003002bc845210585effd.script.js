function onLoad() {
	if (!g_scratchpad.isPremiumActive) {
		g_form.removeOption('type', 'text');
		g_form.removeOption('type', 'insight');
	}
}
