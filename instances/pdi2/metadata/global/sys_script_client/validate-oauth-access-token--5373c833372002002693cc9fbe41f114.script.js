function onLoad() {
	var oauthProfileId = g_form.getValue('oauth2_profile');
	var oauthReqSysId = g_form.getUniqueValue();
	var authType = g_form.getValue('authentication_type');
	
	if (authType != 'oauth2' || !oauthProfileId) {
		// not configured for oauth
		return;
	}
	
	// Clear the previously added messages
	g_form.clearMessages();
	
	var gaAccessToken = new GlideAjax('OAuthAccessToken');
	gaAccessToken.addParam('sysparm_name', 'isAccessTokenAvailable');
	gaAccessToken.addParam('requestor', oauthReqSysId);
	gaAccessToken.addParam('oauth_provider_profile_id', oauthProfileId);
	// Invoke the GlideAjax with a callback function
	gaAccessToken.getXML(parseAjaxResponse);
	return;
}

function parseAjaxResponse(response) {
	var result = response.responseXML.getElementsByTagName('result');
	var isRefreshToken = (result[0].getAttribute('isRefreshToken') == 'true');
	var isAccessToken = (result[0].getAttribute('isToken') == 'true');
	var thirtyDaysInSecs = 30 * 86400;
	
	if (isRefreshToken) {
		// if refreshTokenExpiresInSecs <30 days
		var expiresInSecs = result[0].getAttribute('refreshTokenExpiresInSecs');
		var expiresAt = result[0].getAttribute('refreshTokenExpiresOnDate');
		if (expiresInSecs <= 0) {
			g_form.addWarningMessage(getTokenExpiredMessage('Refresh', expiresAt));
		} else if (expiresInSecs < thirtyDaysInSecs) {
			// show warning about token about to expire on such date
			g_form.addWarningMessage(getTokenAboutToExpireMessage('Refresh', expiresAt));
		} else {
			// show info about having refresh token and will expire on such date
			g_form.addInfoMessage(getTokenAvailableMessage('Refresh', expiresAt));
		}
	} else if (isAccessToken) {
		// if tokenExpiresInSecs <30 days
		var tokenExpiresInSecs = result[0].getAttribute('tokenExpiresInSecs');
		var tokenExpiresAt = result[0].getAttribute('tokenExpiresOnDate');
		if (tokenExpiresInSecs <= 0) {
			g_form.addWarningMessage(getTokenExpiredMessage('Access', tokenExpiresAt));
		} else if (tokenExpiresInSecs < thirtyDaysInSecs) {
			// show warning about token about to expire on such date
			g_form.addWarningMessage(getTokenAboutToExpireMessage('Access', tokenExpiresAt));
		} else {
			// show info about having refresh token and will expire on such date
			g_form.addInfoMessage(getTokenAvailableMessage('Access', tokenExpiresAt));
		}
		
	} else {
		g_form.addWarningMessage(getNoTokensAvailableMessage());
	}
}

function getTokenExpiredMessage(tokenType) {
	var msg = 'OAuth ' + tokenType + ' token is expired. ' + getLinkLocationStringMessage();
	return getMessage(msg);
}

function getTokenAboutToExpireMessage(tokenType, tokenExpiresOnDate) {
	var msg = 'OAuth ' + tokenType + ' token is available but will expire soon at ' + tokenExpiresOnDate + '. ' + getLinkLocationStringMessage();
	return getMessage(msg);
}

function getTokenAvailableMessage(tokenType, tokenExpiresOnDate) {
	var msg = 'OAuth ' + tokenType + ' token is available and will expire at ' + tokenExpiresOnDate + '.';
	return getMessage(msg);
}

function getNoTokensAvailableMessage() {
	var msg = 'OAuth Access or Refresh tokens are not available. ' + getLinkLocationStringMessage();
	return getMessage(msg);
}

function getLinkLocationStringMessage() {
	return 'Verify the OAuth configuration and click the \'Get OAuth Token\' link below to request a new token.';
}
