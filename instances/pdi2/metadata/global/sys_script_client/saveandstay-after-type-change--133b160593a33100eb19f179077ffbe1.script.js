function onChange(control, oldValue, newValue, isLoading) {
	if(control.caller_id != newValue && control.caller_id != null) {     
		 if (g_form.getValue('name') === '' || g_form.getValue('alert_filter') === '') {
			 g_form.setValue('type', oldValue);
			 g_form.showErrorBox('type','First select name and rule filter');
			newValue = oldValue;
		 }
	  
		if (oldValue != newValue) {
			g_form.setValue('incident_template', '');
			gsftSubmit(document.getElementById('sysverb_update_and_stay'));
	}	
	  
	}
	control.caller_id = newValue; 

  
}
