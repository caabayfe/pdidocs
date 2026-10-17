function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || !g_form.isLiveUpdating())
		return;

	g_scratchpad.change_model.requestRefreshUpdateModel();
}
