function onLoad() {
	if(!g_scratchpad.isLEProgressTypeFieldPresent) {
		g_form.setDisplay('is_le_progress', false);
		g_form.setReadOnly('is_le_progress', true);
	}
}
