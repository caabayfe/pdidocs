function onLoad() {
	//Type appropriate comment here, and begin script below
	g_scratchpad.isAutoRecalculating = true;
	if (g_form.isNewRecord())
		g_scratchpad.isAutoRecalculating = false;
}
