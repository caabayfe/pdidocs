function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
      return;
	}

	if(newValue <= 0){
		g_form.showFieldMsg('limit',
			getMessage("Please enter a value greater than 0"),
			'error');
	}
   
}
