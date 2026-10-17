function onLoad() {
	var scope = g_scratchpad.scope||'global';
	if (scope != 'global') 
		g_form.setVisible('scoped_name', true);
	else 
		g_form.setVisible('scoped_name', false);
}
