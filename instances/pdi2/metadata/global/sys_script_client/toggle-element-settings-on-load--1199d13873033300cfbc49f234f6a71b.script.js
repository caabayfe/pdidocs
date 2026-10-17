function onLoad() {
	var typeValue = g_form.getValue("type");
	var indicator = g_form.getValue("indicator");
	var breakdown = g_form.getValue("breakdown");
	var visualization = g_form.getValue("visualization");
	var allowedVisualizations = ["breakdown", "time", "score"];
	if (allowedVisualizations.indexOf(typeValue) === -1 || visualization === 'pivot_scorecard' ) {
		g_form.setSectionDisplay('element_settings', false);
	} else if (!indicator || !breakdown) {
		g_form.setSectionDisplay('element_settings', true);
		g_form.setDisabled('elements_filter', true);
	} else {
		g_form.setSectionDisplay('element_settings', true);
		g_form.setDisabled('elements_filter', false);
	}
}
