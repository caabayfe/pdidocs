function onLoad() {
	var vncc_enabled = g_scratchpad.vncc_property;
	if (vncc_enabled == "true" || vncc_enabled == "True") {
		g_form.setDisplay("node_type", true);
		g_form.setDisplay("schedulers", false);
	} else {
		g_form.setDisplay("node_type", false);
		g_form.setDisplay("schedulers", true);
	}
}
