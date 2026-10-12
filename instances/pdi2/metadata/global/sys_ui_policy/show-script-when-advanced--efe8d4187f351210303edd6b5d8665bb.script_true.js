function onCondition() {
	// Set following fields invisible
	g_form.setVisible('condition', false);
	g_form.setVisible('roles', false);
	g_form.setMandatory('view', false);
	g_form.setVisible('view', false);
	g_form.setDisplay('script', true);
	
	// Set following sections invisible
	g_form.setSectionDisplay('conditions', false);
}
