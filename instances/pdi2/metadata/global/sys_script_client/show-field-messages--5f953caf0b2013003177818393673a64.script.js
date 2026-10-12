function onLoad() {
   if (g_form.getValue("on_hold") === 'true') {
		g_form.showFieldMsg("state", getMessage("Change is currently on hold"), "info");
		return;
	}

	if (g_form.getValue('state') == "-4" || g_form.getValue('state') == "-3" )
		g_form.showFieldMsg("state", getMessage("Change is waiting for approval"), "info");
}
