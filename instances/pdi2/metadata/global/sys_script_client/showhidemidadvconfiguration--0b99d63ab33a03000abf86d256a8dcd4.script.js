function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	// show / hide the Advanced MID Server Configuration section
	var midSelection = g_form.getValue('mid_selection');
	if (newValue == "true") {
		if( "specific_mid_server" == midSelection)
			g_form.setMandatory('mid_server',true);
		if( "specific_mid_cluster" == midSelection)
			g_form.setMandatory('mid_cluster',true);
		g_form.setSectionDisplay('advanced_midserverconfiguration', true);	
	}
	else {
		g_form.setMandatory('mid_server',false);
		g_form.setMandatory('mid_cluster',false);
		g_form.setSectionDisplay('advanced_midserverconfiguration', false);		
	}
		
}
