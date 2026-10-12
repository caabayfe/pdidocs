function onSubmit() {

	if ((g_form.getValue('visualization') == 'speedometer' || g_form.getValue('visualization') == 'dial') && g_form.getValue('gauge_autoscale') == 'false') {

	    var gauge_from = g_form.getIntValue('gauge_from');	
 	    var gauge_to = g_form.getIntValue('gauge_to');

	    if (gauge_to > gauge_from)
		    return true;

    	g_form.showFieldMsg('gauge_to', getMessage('To must have a value bigger than From'), 'error');

        return false;
	}
	return true;
   
}
