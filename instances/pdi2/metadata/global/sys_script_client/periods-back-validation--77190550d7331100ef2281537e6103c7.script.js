function onSubmit() {
    if (g_form.getValue('visualization') == 'latest' && g_form.getValue('lastscore_compare') == 'periods_back') {
		if (g_form.getIntValue('lastscore_periods_back') > 0)
	    	return true;
	
    	g_form.showFieldMsg('lastscore_periods_back', getMessage('Please submit a positive integer'), 'error');
    	return false;
	}
	
	return true;
   
}
