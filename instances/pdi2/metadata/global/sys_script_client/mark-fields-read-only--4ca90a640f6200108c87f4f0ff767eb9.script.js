function onLoad() {
	if (g_form.isNewRecord())
		return;
	
	g_form.setReadOnly('table', true);
	g_form.setReadOnly('process_definition', true);
}
