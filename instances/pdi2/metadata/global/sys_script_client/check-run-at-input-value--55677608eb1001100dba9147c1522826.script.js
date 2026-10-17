function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }
	
    if (newValue == '') {
        g_form.showFieldMsg("run_at", "Info: Please specify the date and time.", "info");
    }
	var jsRunDt = new Date(getDateFromFormat(newValue, g_user_date_time_format));
    var jsToday = getUserDateTime();

    if (jsRunDt < jsToday) {
        g_form.showFieldMsg("run_at", "Error: The scheduled time has passed.", "error");
    } else {
        g_form.showFieldMsg("run_at", "Warning: Scheduling to run later may affect a different number of records", "warning");
    }
}
