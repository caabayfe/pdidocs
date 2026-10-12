function onBefore(current, previous) {
   // If the user is enrolled with Google Auth from password reset application 
   // then don't delete the auth settings
   if (new PwdGoogleAuthenticator().isUserEnabledPwdGoogleAuth(current.sys_id, false))
	   return;
	
   var authRecord = new GlideRecord("user_multifactor_auth");
	authRecord.addQuery("user", current.sys_id);
	authRecord.query();
	while(authRecord.next()){
		authRecord.deleteRecord();
	}
   
}
