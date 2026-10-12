(function executeRule(current, previous /*null when async*/) {

	var isGoogleAuthEnabled = gs.getProperty('glide.authenticate.multifactor', 'false') === 'true';
	if (isGoogleAuthEnabled)
		return;
	
	var mapGr = new GlideRecord('pwd_map_proc_to_verification');
	mapGr.addQuery('process', current.sys_id);
	mapGr.addQuery('verification.type', 'c7835ab787773200cfab6dd207cb0b88');
	mapGr.query();
	if (mapGr.hasNext()) {
		current.active = false;
		
		var linkText = gs.getMessage("enable the property");
		var link = '<a href="/system_properties_ui.do?sysparm_title=Multifactor%20Authentication%20Properties&sysparm_category=MultifactorAuth">' + linkText + '</a>';
		
		var message = gs.getMessage("This Password Reset process was deactivated because the Authenticator App verification type requires that the Multi-factor authentication system property is enabled. To activate this process, you must {0}.", link);
		
		gs.addErrorMessage(message);
	}
	
})(current, previous);
