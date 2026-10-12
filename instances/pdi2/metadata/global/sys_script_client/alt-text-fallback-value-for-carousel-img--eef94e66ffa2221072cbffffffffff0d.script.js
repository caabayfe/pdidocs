function onLoad() {
   //Type appropriate comment here, and begin script below
	if (!g_form.getValue('alt_text')) {
		var name = g_form.getValue('name');
		g_form.setValue('alt_text', name);
	}
}
