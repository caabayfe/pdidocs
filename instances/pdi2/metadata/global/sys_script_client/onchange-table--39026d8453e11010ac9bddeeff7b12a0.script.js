function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading) {
      return;
   }

   if(g_form.getValue('action'))
	   g_form.setValue('action', '');
	
	
   if(g_form.getValue('layout_group'))
	   g_form.setValue('layout_group', '');
}
