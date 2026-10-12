var OauthAPIScriptForBitbucket = Class.create();
OauthAPIScriptForBitbucket.prototype = {
    initialize: function(oauthContext) {
        this.oauthContext = oauthContext;
    },

    interceptRequestParameters: function(requestParamMap) {
        this.preprocessAccessToken(requestParamMap);
    },

    parseTokenResponse: function(accessTokenResponse) {
        this.postprocessAccessToken(accessTokenResponse);
    },

    preprocessAuthCode: function(requestParamMap) {},

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
        var tokenResponse = (new global.JSON()).decode(accessTokenResponseBody);
        for (param in tokenResponse)
            paramMap.put(param, tokenResponse[param].toString());
    },

    type: 'OauthAPIScriptForBitbucket'
};
