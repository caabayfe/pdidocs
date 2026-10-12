function onSubmit() {
	g_form.clearMessages();
    var beginDate = g_form.getValue("begin");
    var endDate = g_form.getValue("end");
	var format = g_user_date_time_format;

	// If both are not defined. That's fine as they are not mandatory.

	if(!beginDate && !endDate)
		return true;

	if(beginDate && endDate) {
		// get actual date object that enables us to compare
		var beginDateMs = getDateFromFormat(beginDate, format);
		var endDateMs = getDateFromFormat(endDate, format);

		if (beginDateMs < endDateMs) {
			return true;
		}
		else {
			g_form.addErrorMessage(getMessage("End date must be after begin date"));
			return false;
		}
    }
}
