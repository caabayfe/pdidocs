function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   if (g_form.getValue('display_name') == '') {
	   g_form.setValue('display_name', g_form.getReference('notification').getValue('name'));
   }
}
