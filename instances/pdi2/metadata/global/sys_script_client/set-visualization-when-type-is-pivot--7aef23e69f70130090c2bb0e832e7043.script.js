function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	if (newValue == 'pivot') {
		g_form.setValue('visualization', 'heatmap');
	}
}
