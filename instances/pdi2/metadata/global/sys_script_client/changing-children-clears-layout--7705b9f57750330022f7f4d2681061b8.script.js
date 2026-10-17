function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   var component = g_form.getControl('component');
	
   if (isLoading || newValue === '') {
      return;
   }

   // Clear Layout field
   g_form.clearValue('layout');
}
