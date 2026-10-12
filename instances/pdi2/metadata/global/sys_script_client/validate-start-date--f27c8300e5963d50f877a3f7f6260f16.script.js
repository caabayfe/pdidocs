/* global isDate */
function onSubmit() {
	g_form.clearMessages();
	var phaseStartDate = g_form.getValue('start_date');
	if (!isDate(phaseStartDate, g_user_date_format)) {
		g_form.addErrorMessage('Invalid Phase Start Date');
		return false;
	}
	return true;
}
