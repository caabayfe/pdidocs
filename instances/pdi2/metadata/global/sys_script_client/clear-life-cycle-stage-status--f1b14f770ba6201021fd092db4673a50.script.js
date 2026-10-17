function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}
	g_form.clearValue('life_cycle_stage_status');
}
