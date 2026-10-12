function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue == '2') {
		g_form.showRelatedList('pa_job_indicator_breakdown_ex');
	} else {
		g_form.hideRelatedList('pa_job_indicator_breakdown_ex');
	}
}
