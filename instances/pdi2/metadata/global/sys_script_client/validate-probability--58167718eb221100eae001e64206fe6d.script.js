function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '')
      return;
	
	var percent = g_form.getIntValue('percent_random');
	if (percent <= 1)
		percent = 1;		
	else if (percent >= 100)
		percent = 100;
	
	if (g_form.getValue('percent_random') != percent) 
		g_form.setValue('percent_random', percent);
}
