function onLoad() {
	if (typeof g_form === 'undefined') {
		return;
	}
	var value = g_form.getValue('client_script_v2');
	if (value) {
		return;
	}
	
	g_form.setValue('client_script_v2', 'function onClick(g_form) {\n\n}');
}
