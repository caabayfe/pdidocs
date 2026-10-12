function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '')
      return;
	if (newValue !== '') 
		g_form.setValue('aria_label', '');
   
}
