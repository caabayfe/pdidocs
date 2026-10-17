function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
      return;
	}
	
	if(newValue == 'vertical' && g_form.getValue('max_items_display_count') == '3')
		g_form.setValue('max_items_display_count', '15');

	else if(newValue == 'horizontal' && g_form.getValue('max_items_display_count') == '15')
		g_form.setValue('max_items_display_count', '3');
  
}
