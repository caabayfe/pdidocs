function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var theLisst = "pa_indicator_breakdown_excl";
	var breakdown_count = g_form.getIntValue('related_breakdowns');
	if (newValue === "true" && (breakdown_count > 0))
		g_form.showRelatedList(theLisst);
	else
		g_form.hideRelatedList(theLisst);
}
