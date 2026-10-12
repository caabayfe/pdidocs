function onLoad() {
	if (g_form.isNewRecord()) {
		g_form.setValue("fetch_type", "dynamic_prefetch");
		g_form.setValue("dynamic_prefetch_count", 10);
	}
}
