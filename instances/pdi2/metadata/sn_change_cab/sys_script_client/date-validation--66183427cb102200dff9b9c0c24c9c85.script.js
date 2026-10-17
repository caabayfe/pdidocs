function onSubmit() {
	g_form.clearMessages();
	
	var valid = true;
	if (!validateDates("start", "end"))
		valid = false;
	
	if (!validateDates("change_range_start", "change_range_end"))
		valid = false;
	
	return valid;
}

function validateDates(fromFieldName, toFieldName){
	var startDate = g_form.getValue(fromFieldName);
	var endDate = g_form.getValue(toFieldName);
	var format = g_user_date_time_format;

	if (startDate === "" || endDate === "")
		return true;

	// get date strings into a number of milliseconds since 1970-01-01
	var startDateMs = getDateFromFormat(startDate, format);
	var endDateMs = getDateFromFormat(endDate, format);

	if (startDateMs < endDateMs)
		return true;

	// 0 from "getDateFormat" means an invalid date string was passed to it
	if (startDateMs === 0 || endDateMs === 0) {
		if (startDate === 0)
			g_form.addErrorMessage(new GwtMessage().getMessage("{0} is invalid", g_form.getLabelOf(fromFieldName)));

		if (endDate === 0)
			g_form.addErrorMessage(new GwtMessage().getMessage("{0} is invalid", g_form.getLabelOf(toFieldName)));

		return false;
	}

	if (startDateMs >= endDateMs) {
		g_form.addErrorMessage(new GwtMessage().getMessage("{0} must be after {1}", g_form.getLabelOf(toFieldName), g_form.getLabelOf(fromFieldName)));

		return false;
	}
}
