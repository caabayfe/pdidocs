function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var DISMISSIBLE_FIELD_NAME = "dismissible";

	if (newValue == 'false') {
		var translatedLabel = g_form.getLabelOf(DISMISSIBLE_FIELD_NAME);
		var gwt = new GwtMessage();
		var msg = gwt.getMessage('If "{0}" is disabled, your pop-up card must contain a button to close the pop-up. Otherwise, this setting will be ignored.', translatedLabel);
		g_form.showFieldMsg(DISMISSIBLE_FIELD_NAME, msg);
	}
}
