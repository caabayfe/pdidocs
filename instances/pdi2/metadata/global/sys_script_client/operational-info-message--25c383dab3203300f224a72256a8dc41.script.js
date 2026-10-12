function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   if (newValue === 'operational') {
		g_form.addInfoMessage(getMessage('Once the service status is saved as operational it can only move forward to retiring, retired or obsolete.'));
	}
   
}
