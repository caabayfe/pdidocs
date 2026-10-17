(function() {
		//This fix script will only run for the Zboot scenarios
		if (!pm.isZboot()) 
			return;
		GlidePropertiesDB.invalidate();
		//change the password only if its the default one else no need to change
		if (gs.getProperty("glide.user.default_password") != "MyComp@ny123!") {
			gs.info('Default Password Sys Property value will not be updated, as its not a default password');
			return;
		}
		GlidePropertiesDB.set("glide.user.default_password", GlideSecureRandomUtil.getSecureRandomString(13));
}());
