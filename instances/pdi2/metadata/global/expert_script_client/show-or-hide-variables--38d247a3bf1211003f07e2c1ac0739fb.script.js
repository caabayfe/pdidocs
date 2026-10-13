function onLoad() {
	g_form.setVisible("group", false);
	hideShiftEnd();
}

function hideShiftEnd() {
	// get the value of the all_day shift variable and hide the shift_end datetime field
	// if the user has selected Yes for the all_day shift variable
	var notAllDay = (g_form.getValue("all_day") == "No");
	g_form.setVisible("shift_end", notAllDay);
	g_form.setMandatory("shift_end", notAllDay);
}
