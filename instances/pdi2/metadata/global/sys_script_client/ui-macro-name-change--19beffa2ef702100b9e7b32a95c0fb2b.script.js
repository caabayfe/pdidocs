function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '')
      return;
	
   if (newValue == oldValue)
	   return;
	
	var scope = g_scratchpad.scope||'global';
	if (scope != 'global') {
		var pageName = g_form.getValue('name');
		g_form.setValue('scoped_name', scope + '_' + newValue);
	}
}
