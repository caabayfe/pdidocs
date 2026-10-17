function onConfirm() {
	if (!g_form.hasField("state")) {
		getMessage('Cannot confirm the Problem as \'State\' is not visible', function(msg) {
			g_form.addErrorMessage(msg);
		});
		return false;
	}
	g_form.setValue("state", g_scratchpad.STATE.ROOT_CAUSE_ANALYSIS);
	g_form.save();
}
