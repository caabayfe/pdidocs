function onCondition() {
	
	if(g_form.getValue('scripted') == 'true'){
		g_form.setDisplay('script', true);
		g_form.setDisplay('field', false);
	} else {
		g_form.setDisplay('field', true);
		g_form.setDisplay('script', false);
	}
}
