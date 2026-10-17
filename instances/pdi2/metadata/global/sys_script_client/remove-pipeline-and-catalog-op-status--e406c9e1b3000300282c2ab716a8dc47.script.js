function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {}
	
	if (newValue) {
		if (newValue == 7||newValue == 8) {
			var choice = '';
			if (newValue == 7) 
				choice = 'Pipeline';
			else if (newValue == 8) 
				choice = 'Catalog';
				g_form.clearMessages();
				g_form.addErrorMessage('A new field "Portfolio Status" has been added in the Kingston release which contains Pipeline, Catalog, and Retired values.  Please consider using ' + choice + ' in the Portfolio Status field and adjust your business logic accordingly.');	

				g_form.showFieldMsg('operational_status', 'Please choose ' + choice + ' from the new "Portfolio Status" field', 'error');
		}
	}
}
