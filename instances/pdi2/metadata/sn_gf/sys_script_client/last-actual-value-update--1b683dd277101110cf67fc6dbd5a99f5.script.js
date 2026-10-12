function onLoad() {
	if(!g_form.isNewRecord() && g_scratchpad.lastActualUpdated)
		g_form.showFieldMsg('actual_value',g_scratchpad.lastActualUpdated);
}
