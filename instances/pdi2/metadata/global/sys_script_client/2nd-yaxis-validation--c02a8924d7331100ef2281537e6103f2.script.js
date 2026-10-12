function onSubmit() {

	if (g_form.getValue('type') == 'time' 
		&& (g_form.getValue('yaxis2_to') != '' && g_form.getValue('yaxis2_from')) != '') {

	    var yaxis2_from = g_form.getIntValue('yaxis2_from');	
 	   var yaxis2_to = g_form.getIntValue('yaxis2_to');

	    if (yaxis2_to > yaxis2_from)
		    return true;

    	g_form.showFieldMsg('yaxis2_to', getMessage('To must have a value bigger than From'), 'error');

        return false;
	}
	return true;
   
}
