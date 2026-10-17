(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	// if the associated app passed into the `hasLicenseForApp` check does not exist, an error/
	// exception is thrown (false is not returned, womp) - so we must keep track of license check for
	// both ways that the AES app can be install (side-loaded & installed through store/plugin list)
	
	// if `com.snc.app-engine-studio` is the scoped app id, then app is installed through 
	// store / plugin
	
	// if `sn_app_eng_studio` is the scoped app id, then app has been side-loaded into the system (
	// via the Install Application platform feature)
	
	var hasLicenseForApp = false;
	
	try {
		// checks if the user has a license for AES - installed via the app store / plugins list
		hasLicenseForApp = sn_lef.GlideEntitlement.hasLicenseForApp('com.snc.app-engine-studio');
	} catch (e) {
		hasLicenseForApp = false;
	}
	
	if (!hasLicenseForApp) {
		try {
			// checks if the user has a license for AES - installed via side-loading
			hasLicenseForApp = sn_lef.GlideEntitlement.hasLicenseForApp('sn_app_eng_studio');
		} catch (e) {
			hasLicenseForApp = false;
		}
	}
	
	response.setBody({
		hasLicenseForApp: hasLicenseForApp,
	});
	
	response.setStatus(200);

})(request, response);
