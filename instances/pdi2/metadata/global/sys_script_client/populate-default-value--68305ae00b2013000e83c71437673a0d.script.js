function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   if (newValue == 'slack')
	   g_form.setValue('oauth_endpoint', 'https://slack.com/oauth/authorize');
	
   if (newValue == 'teams') {
	   g_form.setValue('oauth_endpoint', 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
	   g_form.setValue('oauth_scope', 'openid profile email');
   }
	
   
}
