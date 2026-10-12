function onCondition() {
	if (g_scratchpad.isProcessWidget) {
		g_form.setDisplay('color', false);
		g_form.setDisplay('second_y_axis', false);
		g_form.setDisplay('chart_type', false);
	}
}
