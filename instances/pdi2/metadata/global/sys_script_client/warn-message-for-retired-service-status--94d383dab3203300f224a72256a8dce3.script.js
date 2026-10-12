function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	if (newValue === 'retired') {
		g_form.showFieldMsg('service_status', getMessage('Retiring a service would retire all its service offerings.'), 'warning');	
	}   
}
