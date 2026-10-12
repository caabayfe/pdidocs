function onLoad() {
   var state = g_form.getValue('state');
	
	if(state === 'published') {
		g_form.setReadOnly('state', true);
		g_form.setDisplay('script', false);
	} else {
		g_form.setReadOnly('state', false);
		g_form.setDisplay('script', true);
	}
   
}
