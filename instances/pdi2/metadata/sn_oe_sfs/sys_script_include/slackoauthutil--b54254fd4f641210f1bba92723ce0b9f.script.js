var SlackOAuthUtil = Class.create();
SlackOAuthUtil.prototype = Object.extendsObject(global.OAuthUtil, {
	// persist user token in sys_cs_collab_provider_user_profile record and publish to AMB.
	postprocessAccessToken: function(accessTokenResponse) {
		var userID; var userToken;
		var contentType = accessTokenResponse.getContentType();
		if (contentType && contentType.indexOf('application/json') != -1) {
			var tokenResponse = (new global.JSON()).decode(accessTokenResponse.getBody());
			userToken = tokenResponse.authed_user.access_token;
			var collabProviderUserProfileGR = new GlideRecord('sys_cs_collab_provider_user_profile');
			collabProviderUserProfileGR.addQuery('external_user_id', tokenResponse.authed_user.id);
			collabProviderUserProfileGR.addQuery('provider', '1f2e35d1a3f382106cdec213d51e61ae'); //Slack Provider
			collabProviderUserProfileGR.query();
			if (collabProviderUserProfileGR.next()) {
				var collabUserSysId = collabProviderUserProfileGR.getValue('collab_user');
				var collabUserGR = new GlideRecord('sys_cs_collab_user');
				if (collabUserGR.get(collabUserSysId)) {
					userID = collabUserGR.getValue('user');
				}
				// Save user token
				collabProviderUserProfileGR.getElement('user_token').setDisplayValue(userToken);
				collabProviderUserProfileGR.update();
			}
		}
		//publish to AMB channel
		gs.publish("/collabchat/slack/user_token/" + userID, {
			"userToken": userToken
		});

		var paramMap = accessTokenResponse.getparameters();
		for (param in tokenResponse) {
			paramMap.put(param, tokenResponse[param].toString());
		}
	},
    type: 'SlackOAuthUtil'
});
