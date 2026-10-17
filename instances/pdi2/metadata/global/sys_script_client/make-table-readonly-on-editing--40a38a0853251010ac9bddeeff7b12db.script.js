function onLoad() {
	if (!g_form.isNewRecord()) 
		g_form.setReadOnly('table');
}
