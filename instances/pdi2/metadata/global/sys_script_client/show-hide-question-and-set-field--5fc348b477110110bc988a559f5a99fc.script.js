function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	
   //Type appropriate comment here, and begin script below
   if (newValue == 'true') {
		g_form.setDisplay('item_option_new', false);
		g_form.clearValue('item_option_new');
		g_form.setDisplay('set', true);
   }
	else {
		g_form.setDisplay('item_option_new', true);
		g_form.setDisplay('set', false);
		g_form.clearValue('set');
	}
}
