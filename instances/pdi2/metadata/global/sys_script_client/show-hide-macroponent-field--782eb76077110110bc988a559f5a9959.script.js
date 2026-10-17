function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	
	//Type appropriate comment here, and begin script below
	if (newValue == 'true')
		g_form.setDisplay('macroponent', true);
	else 
		g_form.setDisplay('macroponent', false);
   
}
