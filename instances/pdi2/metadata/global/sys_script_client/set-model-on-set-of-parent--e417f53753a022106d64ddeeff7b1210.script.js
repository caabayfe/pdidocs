function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   //When the parent is set default model to Extension
   if (oldValue == newValue)
		return;
	
	if (g_form.getValue('model') == null || g_form.getValue('model') == '')
		g_form.setValue('model', 'extension');
   
}
