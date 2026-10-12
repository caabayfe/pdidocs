function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue == "true") {
		g_form.setVisible("indicator_condition", true);
		g_form.hideRelatedList("pa_m2m_indicator_notifications");
	}
	else {
		g_form.setVisible("indicator_condition", false);
		g_form.showRelatedList("pa_m2m_indicator_notifications");
	}
}
