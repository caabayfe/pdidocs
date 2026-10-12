function onLoad() {
	// Get the current view name
	var currView = g_form.getViewName();

	// Get the grant type
	var grantType = g_form.getValue('grant_type');

	// Switch to Oauth Provider View if grant_type is JWT Bearer, SAML2 Bearer, or Token Exchange and current view is default
	var isExtensionGrant = ((grantType == 'urn:ietf:params:oauth:grant-type:jwt-bearer') || (grantType == 'urn:ietf:params:oauth:grant-type:saml2-bearer') || (grantType == 'urn:ietf:params:oauth:grant-type:token-exchange'));
	if( isExtensionGrant && currView == 'default'){
		switchView('section','oauth_entity_profile','oauth_provider');
	}
}
