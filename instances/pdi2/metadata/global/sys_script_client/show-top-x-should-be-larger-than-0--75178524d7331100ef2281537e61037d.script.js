function onSubmit() {
    if (g_form.getValue('type') == 'breakdown' && g_form.getValue('show_top_x') != '') {
		if (g_form.getIntValue('show_top_x') > 0)
	    	return true;
	
    	g_form.showFieldMsg('show_top_x', getMessage('Please submit a positive integer'), 'error');
    	return false;
	}
	
	return true;
   
}
