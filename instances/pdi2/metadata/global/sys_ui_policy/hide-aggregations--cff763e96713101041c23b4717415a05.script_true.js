function onCondition() {
	if (g_scratchpad && g_scratchpad.isBusinessCalendar) {
		g_form.setDisplay('aggregate', false);
		g_form.setDisplay('is_compare_chart', false);
	}
}
