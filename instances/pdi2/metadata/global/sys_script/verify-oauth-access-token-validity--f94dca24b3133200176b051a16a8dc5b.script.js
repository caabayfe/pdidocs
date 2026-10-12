(function executeRule(current, previous /*null when async*/) {
	
	var oAuthClient = new  sn_auth.GlideOAuthClient();
	var integrationType = String(current.integration_type);
	if(integrationType === 'personal'){
		oAuthClient.setPersonal(true);
	}
		
	var token = oAuthClient.getToken(current.getUniqueValue(), current.oauth_entity_profile);
	var thirtyDaysInSecs = 30 * 86400;
	
	var tokenData = {};
		if (token) {
			if(token.getAccessToken()) {
				tokenData.isAccessToken=true;
				tokenData.expiresInSecs = token.getExpiresIn();
				var tokenExpiresInMs = new GlideTime(token.getExpiresIn() * 1000);
				var tokenExpiresOnDate = new GlideDateTime();
				tokenExpiresOnDate.add(tokenExpiresInMs);
				tokenData.tokenExpiresOnDate=tokenExpiresOnDate.getDisplayValue();
			}
			if (token.getRefreshToken()) {
				tokenData.isRefreshToken=true;
				tokenData.refreshExpiresInSecs = token.getRefreshTokenExpiresIn();
				var refreshExpiresInMs = new GlideTime(token.getRefreshTokenExpiresIn() * 1000);
				var refreshExpiresOnDate = new GlideDateTime();
				refreshExpiresOnDate.add(refreshExpiresInMs);
				tokenData.refreshTokenExpiresOnDate=refreshExpiresOnDate.getDisplayValue();
			}
			if (tokenData.isRefreshToken) {
				// if refreshTokenExpiresInSecs <30 days
				var expiresInSecs = tokenData.refreshExpiresInSecs;
				var expiresAt = tokenData.refreshTokenExpiresOnDate;
				if (expiresInSecs <= 0) {
					gs.addErrorMessage(getTokenExpiredMessage('Refresh', expiresAt));
				} else if (expiresInSecs < thirtyDaysInSecs) {
					// show warning about token about to expire on such date
					gs.addErrorMessage(getTokenAboutToExpireMessage('Refresh', expiresAt));
				} else {
					// show info about having refresh token and will expire on such date
					gs.addInfoMessage(getTokenAvailableMessage('Refresh', expiresAt));
				}
			} else if (tokenData.isAccessToken) {
				// if tokenExpiresInSecs <30 days
				var tokenExpiresInSecs = tokenData.expiresInSecs;
				var tokenExpiresAt = tokenData.tokenExpiresOnDate;
				if (tokenExpiresInSecs <= 0) {
					gs.addErrorMessage(getTokenExpiredMessage('Access', tokenExpiresAt));
				} else if (tokenExpiresInSecs < thirtyDaysInSecs) {
					// show warning about token about to expire on such date
					gs.addErrorMessage(getTokenAboutToExpireMessage('Access', tokenExpiresAt));
				} else {
					// show info about having refresh token and will expire on such date
					gs.addInfoMessage(getTokenAvailableMessage('Access', tokenExpiresAt));
				}
			} else {
				gs.addErrorMessage(getNoTokensAvailableMessage());				
			}
		} else {
			gs.addErrorMessage(getNoTokensAvailableMessage());
		}
		function getTokenExpiredMessage(tokenType) {
			return gs.getMessage('OAuth {0} token is expired. Verify the OAuth configuration and click the \'Get OAuth Token\' link below to request a new token.', tokenType);
		}
		
		function getTokenAboutToExpireMessage(tokenType, tokenExpiresOnDate) {
			return gs.getMessage('OAuth {0} token is available but will expire soon at {1}. Verify the OAuth configuration and click the \'Get OAuth Token\' link below to request a new token.', [tokenType, tokenExpiresOnDate]);
		}
		
		function getTokenAvailableMessage(tokenType, tokenExpiresOnDate) {
			return gs.getMessage('OAuth {0} token is available and will expire at {1}', [tokenType, tokenExpiresOnDate]);
		}
		
		function getNoTokensAvailableMessage() {
			return gs.getMessage('OAuth Access or Refresh tokens are not available. Verify the OAuth configuration and click the \'Get OAuth Token\' link below to request a new token.');
		}
		
		function getLinkLocationStringMessage() {
			return 'Verify the OAuth configuration and click the \'Get OAuth Token\' link below to request a new token.';
		}
	})(current, previous);
