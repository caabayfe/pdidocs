function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   if( newValue.toLowerCase() == 'true')	{
	   g_form.setValue('default_grant_type', 'authorization_code');
   }

   
}
