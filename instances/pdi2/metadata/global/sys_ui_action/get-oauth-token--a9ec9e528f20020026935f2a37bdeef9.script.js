function getOAuthTokenFromServiceProvider() {
	// Clear status messages
	g_form.clearMessages();
	
	var oauthRequestorSysId = g_form.getUniqueValue();
	var oauthProfileId = g_form.getValue('oauth2_profile');
	var grantType = g_scratchpad.grant_type;
	var oauthRequestorContext = 'sys_rest_message';
	
	var oauth_initiator_url = '';
	if (grantType === 'password') {
		oauth_initiator_url = '/oauth_password_input.do' +
		'?sysparm_oauth_requestor_context=' + oauthRequestorContext +
		'&sysparm_oauth_requestor=' + oauthRequestorSysId +
		'&sysparm_oauth_provider_profile=' + oauthProfileId;
		
	} else if (grantType === 'client_credentials') {
		oauth_initiator_url = '/oauth_client_credentials_input.do' +
		'?sysparm_oauth_requestor_context=' + oauthRequestorContext +
		'&sysparm_oauth_requestor=' + oauthRequestorSysId +
		'&sysparm_oauth_provider_profile=' + oauthProfileId;
		
	} else if (grantType === 'urn:ietf:params:oauth:grant-type:token-exchange') {
		oauth_initiator_url = '/oauth_token_exchange_input.do' +
		'?sysparm_oauth_requestor_context=' + oauthRequestorContext +
		'&sysparm_oauth_requestor=' + oauthRequestorSysId +
		'&sysparm_oauth_provider_profile=' + oauthProfileId;
		
	} else if (grantType === 'authorization_code') {
		oauth_initiator_url = '/oauth_initiator.do' +
		'?oauth_requestor_context=' + oauthRequestorContext +
		'&oauth_requestor=' + oauthRequestorSysId +
		'&oauth_provider_profile=' + oauthProfileId +
		'&response_type=code';
		
	} else if (grantType === 'urn:ietf:params:oauth:grant-type:jwt-bearer') {
		oauth_initiator_url = '/oauth_jwt_bearer_input.do' +
		'?sysparm_oauth_requestor_context=' + oauthRequestorContext +
		'&sysparm_oauth_requestor=' + oauthRequestorSysId +
		'&sysparm_oauth_provider_profile=' + oauthProfileId;
		
	} else if (grantType === 'urn:ietf:params:oauth:grant-type:saml2-bearer') {
		oauth_initiator_url = '/oauth_saml2_bearer_input.do' +
		'?sysparm_oauth_requestor_context=' + oauthRequestorContext +
		'&sysparm_oauth_requestor=' + oauthRequestorSysId +
		'&sysparm_oauth_provider_profile=' + oauthProfileId;
		
	} else {
		g_form.addErrorMessage('Unsupported OAuth grant type \'' + grantType + '\'.');
		return;
	}
	
	window.open(oauth_initiator_url, '', 'height=500,width=800'); // pops up window
	return;
}
