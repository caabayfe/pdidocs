function onComplete() {
	if (!g_form.hasField("state") || !g_form.hasField("resolution_code")) {
		getMessage('Cannot complete the Problem as atleast one of the following fields are not visible: \'State\' \'Resolution code\'', function(msg) {
			g_form.addErrorMessage(msg);
		});
		return false;
	}

	g_form.setValue("state", g_scratchpad.STATE.CLOSED);
	g_form.setValue("resolution_code", g_scratchpad.RESOLUTION_CODES.FIX_APPLIED);
	g_form.save();
}
