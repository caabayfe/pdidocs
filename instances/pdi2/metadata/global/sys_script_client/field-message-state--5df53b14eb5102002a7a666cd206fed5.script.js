function onLoad() {
	//Only show the message if the change request is on hold and the task is not cancelled or closed.
	if (g_scratchpad.changeIsOnHold && g_form.getBooleanValue('on_hold')) {
		g_form.showFieldMsg("state", getMessage("On hold due to associated Change Request being on hold"));
		return;
	}
}
