function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	if (g_form.getValue('declarative_action')) {
		g_form.setValue('declarative_action', '');
	}
	if (g_form.getValue('ui_action')) {
		g_form.setValue('ui_action', '');
	}
}
