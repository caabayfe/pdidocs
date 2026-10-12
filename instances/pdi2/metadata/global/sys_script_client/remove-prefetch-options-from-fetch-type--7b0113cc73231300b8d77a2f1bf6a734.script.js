function onLoad() {
	// Allowing only deferred fetch types
	g_form.removeOption("fetch_type", "not_required");
	g_form.removeOption("fetch_type", "dynamic_prefetch");
	g_form.setValue('fetch_type', 'background');
}
