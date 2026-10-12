function onLoad() {
	if (g_form.getValue("on_hold") === 'true') {
		g_form.showFieldMsg("state", getMessage("Change is currently on hold"));
		return;
	}
	var stateValue = g_form.getValue("state") + "";
	if (stateValue === "-4" || stateValue === "-3" )
		g_form.showFieldMsg("state", getMessage("Change is waiting for approval"));
}
