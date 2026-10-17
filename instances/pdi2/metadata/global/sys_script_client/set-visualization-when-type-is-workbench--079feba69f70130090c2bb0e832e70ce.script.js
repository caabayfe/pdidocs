function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	if (newValue == 'process') {
		g_form.setValue('visualization', 'process');
	}
}
