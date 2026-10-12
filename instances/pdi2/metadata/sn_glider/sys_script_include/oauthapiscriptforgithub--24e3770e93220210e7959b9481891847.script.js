var OauthAPIScriptForGitHub = Class.create();
OauthAPIScriptForGitHub.prototype = {
    initialize: function(oauthContext) {
        this.oauthContext = oauthContext;
    },

    interceptRequestParameters: function(requestParamMap) {
        this.preprocessAccessToken(requestParamMap);
    },

    parseTokenResponse: function(accessTokenResponse) {
        this.postprocessAccessToken(accessTokenResponse);
    },

    preprocessAuthCode: function(requestParamMap) {
        requestParamMap.put('scope', 'repo');
    },

    preprocessAccessToken: function(requestParamMap) {},

    postprocessAccessToken: function(accessTokenResponse) {
        var paramMap = accessTokenResponse.getparameters();
		if (!paramMap) {
			gs.error('GitOAuth2 - no parameters found in the response');
			return;
		}
        var accessTokenResponseBody = accessTokenResponse.getBody();
		if (!accessTokenResponseBody) {
			gs.error('GitOAuth2 - no response body found in the response');
			return;
		}
		var accessTokenResponseParams = accessTokenResponseBody.split("&");
        for (var i = 0; i < accessTokenResponseParams.length; i++) {
            var parts = accessTokenResponseParams[i].split("=");
            paramMap.put(parts[0], parts[1]);
        }
    },

    type: 'OauthAPIScriptForGitHub'
};
