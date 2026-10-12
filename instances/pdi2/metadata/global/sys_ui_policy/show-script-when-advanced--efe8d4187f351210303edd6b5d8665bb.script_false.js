function onCondition() {
	// Set following fields invisible
	g_form.setVisible('condition', true);
	g_form.setVisible('roles', true);
	g_form.setVisible('view', true);
	g_form.setMandatory('view', true);
	g_form.setDisplay('script', false);
	
	// Set following sections invisible
	g_form.setSectionDisplay('conditions', true);
}
