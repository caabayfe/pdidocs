function onSubmit() {
	
	if (g_form.getValue('type') == 'time' 
		&& (g_form.getValue('yaxis_to') != '' && g_form.getValue('yaxis_from')) != '') {
		
	    var yaxis_from = g_form.getIntValue('yaxis_from');	
 	   var yaxis_to = g_form.getIntValue('yaxis_to');
		
	    if (yaxis_to > yaxis_from)
		    return true;

    	g_form.showFieldMsg('yaxis_to', getMessage('To must have a value bigger than From'), 'error');

        return false;
	}
	return true;
   
}
