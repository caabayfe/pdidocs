function onLoad() {
	var vncc_enabled = g_scratchpad.vncc_property;
	if (vncc_enabled == "true" || vncc_enabled == "True")
		g_form.setDisplay("maximum_concurrency", false);
	else
		g_form.setDisplay("maximum_concurrency", true);
}
