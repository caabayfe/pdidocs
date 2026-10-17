function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   //if (isLoading || newValue === '') {
   if (isLoading) {
      return;
   }
   //Clear Department field
   var department = g_form.getValue('department');
   if (department)
	   g_form.setValue('department','');
}
