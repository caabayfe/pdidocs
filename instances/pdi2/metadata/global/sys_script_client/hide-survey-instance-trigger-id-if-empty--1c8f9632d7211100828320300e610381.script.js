function onLoad() {
	if (g_form.getValue('trigger_id') == '') 
		g_form.setDisplay('trigger_id', false);
	else
		g_form.setReadOnly('trigger_id', true);
}
