function onLoad() {
    //Type appropriate comment here, and begin script below
    if (g_form.getValue('state') == 'solution_complete') {
        g_form.setSectionDisplay('test_solution', true);
    } else {
        g_form.setSectionDisplay('test_solution', false);
    }
	
	if (g_scratchpad.capability == 'classification_trainer') {
		var gr = new GlideRecord('ml_capability_definition_classification');
		gr.get(g_form.getValue('ml_capability_definition'));
		if (gr.getValue('groupby_field') && !gr.getValue('groupby_value'))
			g_form.setSectionDisplay('test_solution', false);
	}
    
}
