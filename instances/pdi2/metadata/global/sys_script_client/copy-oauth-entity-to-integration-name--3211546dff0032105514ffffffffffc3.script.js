function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   g_form.setValue('integration_name', g_form.getDisplayValue('oauth_entity'));
   
}
