function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   if( newValue.toLowerCase() == 'true')	{
	   g_form.setValue('default_grant_type', 'authorization_code');
	   g_form.setValue('code_challenge_method','S256');
   }
   
}
