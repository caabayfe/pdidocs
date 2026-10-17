function onSubmit() {
    var startDate = g_form.getValue("start_date");
    var endDate = g_form.getValue("end_date");
    var format = g_user_date_time_format;

    if (startDate === "" || endDate === "")
        return true;

    // get date strings into a number of milliseconds since 1970-01-01
    var startDateMs = getDateFromFormat(startDate, format);
	var endDateMs = getDateFromFormat(endDate, format);
	
	if (startDateMs < endDateMs)
		return true;

	g_form.clearMessages();
	
	// 0 from "getDateFormat" means an invalid date string was passed to it
	if (startDateMs === 0 || endDateMs === 0) {
        if (startDate === 0)
            g_form.addErrorMessage(new GwtMessage().getMessage("{0} is invalid", g_form.getLabelOf("start_date")));

        if (endDate === 0)
            g_form.addErrorMessage(new GwtMessage().getMessage("{0} is invalid", g_form.getLabelOf("end_date")));

        return false;
    }

	if (startDateMs > endDateMs) {
        g_form.addErrorMessage(new GwtMessage().getMessage("{0} must be after {1}", g_form.getLabelOf("end_date"), g_form.getLabelOf("start_date")));

        return false;

    }

	if (typeof validateMaxDateDuration !== "undefined") { // Need to check if the method exist in case StartEndDateValidation UI Script has been skipped during upgrade
		return validateMaxDateDuration("start_date", "end_date", function(msg) {
			g_form.addErrorMessage(msg);
		});
	}
}
