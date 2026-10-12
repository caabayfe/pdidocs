function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '')
		return;

	// Any change clears the previous message. Only 'static' carries one: 'session' is
	// today's behaviour and 'dynamic' is never cached, so neither moves any eviction
	// responsibility onto the author.
	g_form.hideFieldMsg('script_result_type', true);
	if (newValue != 'static')
		return;

	g_form.showFieldMsg('script_result_type', getMessage("Static criteria results are cached per user. The platform only evicts it on changes that are obvious. Please make sure to evict these based on your script logic"), 'info');
}
