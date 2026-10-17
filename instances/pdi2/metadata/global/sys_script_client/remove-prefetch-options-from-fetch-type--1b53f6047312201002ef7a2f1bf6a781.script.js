function onLoad() {
	g_form.removeOption("fetch_type", "dynamic_prefetch");
	if(!g_form.isNewRecord())
		return;
}
