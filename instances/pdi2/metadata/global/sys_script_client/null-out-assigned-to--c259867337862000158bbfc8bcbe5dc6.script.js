function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }

   //Type appropriate comment here, and begin script below
   if (g_form.getValue('allocated_to') != '') {
	  g_form.setValue('assigned_to', '');
	  g_form.setMandatory('allocated_to', true);
	  g_form.setMandatory('assigned_to', false);
   }
   return;
   
}
