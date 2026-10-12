function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }

   //Type appropriate comment here, and begin script below
   if (g_form.getValue('assigned_to') != '') {
	  g_form.setValue('allocated_to', '');
	  g_form.setMandatory('allocated_to', false);
	  g_form.setMandatory('assigned_to', true);
   }
   return;
   
}
