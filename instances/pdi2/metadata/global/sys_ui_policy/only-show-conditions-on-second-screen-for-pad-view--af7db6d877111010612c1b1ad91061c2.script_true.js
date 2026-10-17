function onCondition(current) {
	if (g_form.isNewRecord())
		return; 

	g_form.setDisplay('label', false);
	g_form.setDisplay('sys_scope', false);
	g_form.setDisplay('active', false);
	g_form.setDisplay('trigger_type', false);
}
