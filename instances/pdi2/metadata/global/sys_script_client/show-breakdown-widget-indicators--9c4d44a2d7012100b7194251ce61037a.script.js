function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue == 'pivot_scorecard') {
		g_form.showRelatedList('pa_m2m_widget_indicators');
	} else {
	    g_form.hideRelatedList('pa_m2m_widget_indicators');
	}
}
