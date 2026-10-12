function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
      return;
	}

	if(newValue < 0){
		g_form.showFieldMsg('offset',
			getMessage("Please enter a value greater than or equal to 0"),
			'error');
	}
   
}
