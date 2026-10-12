function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	
	if(newValue == 'All'){
		g_form.showFieldMsg('type',
			getMessage("Use caution when applying a Rate Limit Rule to such a large group."),
			'warning');
	}
}
