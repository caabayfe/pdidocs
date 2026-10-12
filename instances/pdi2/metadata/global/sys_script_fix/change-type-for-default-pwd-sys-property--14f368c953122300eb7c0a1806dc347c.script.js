(function() {

		//This Fix script should only run for Upgrade not for Zboot.
		if (pm.isZboot()) 
			return;

		GlidePropertiesDB.invalidate();
		var defaultPwdSysProperty = new GlideRecord("sys_properties");
		if (!defaultPwdSysProperty.get("name", "glide.user.default_password")) {
			gs.info("Sys Property 'glide.user.default_password' does not exists. Sys Property will not be updated");
			return;
		}

		// Not need to change the type if its 'password2'
		if (defaultPwdSysProperty.getValue("type") == "password2") {
			gs.info("The type for Default Password Sys Property will not be updated as its already 'password2'");
			return;
		}
		
		defaultPwdSysProperty.setValue("type", "password2");
		// Overriding the property value only if its the default password.
		if (gs.getProperty("glide.user.default_password") == "MyComp@ny123!")
			defaultPwdSysProperty.setValue("value", GlidePropertiesDB.encryptValue(GlideSecureRandomUtil.getSecureRandomString(13)));
		defaultPwdSysProperty.update();
}());
