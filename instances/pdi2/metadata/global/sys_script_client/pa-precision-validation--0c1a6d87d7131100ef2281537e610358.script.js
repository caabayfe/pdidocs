function onSubmit() {
    if (g_form.getIntValue('precision') >= 0)
	    return true;
	
    g_form.showFieldMsg('precision', getMessage('Please submit a positive integer'), 'error');
    return false;
   
}
