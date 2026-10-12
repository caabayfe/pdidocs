function onSubmit() {
	if (g_form.getValue("run_type") != "weekly")
		return true;
	var fieldName = 'run_daysofweek';
    if (g_form.isVisible(fieldName)) {
        if (g_form.getValue(fieldName) == null || g_form.getValue(fieldName) === '') {
            g_form.addErrorMessage(getMessage('Run days of week cannot be empty'));
            return false;
        }
    }
    return true;
}
